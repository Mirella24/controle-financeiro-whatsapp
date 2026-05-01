const crypto = require("crypto");
const { parseMessage } = require("../utils/parser");
const { createEntry } = require("../services/entries.service");
const { sendMessage, sendMedia } = require("../services/evolution.service");
const { generatePersonReportPdf } = require("../services/pdf.service");
const { supabase } = require("../config/supabase");
const { formatCurrency } = require("../utils/formatCurrency");

const processedMessages = new Set();

const lastListedEntriesByChat = new Map();

async function webhook(req, res) {
  const requestId = crypto.randomUUID();

  try {
    console.log(`\n🟢 [${requestId}] NOVA REQUISIÇÃO webhook.controller.js`);
    console.log(`[${requestId}] BODY:`, JSON.stringify(req.body, null, 2));

    const message = req.body?.data;

    if (!message) {
      console.log(`[${requestId}] ❌ Mensagem não encontrada`);
      return res.sendStatus(200);
    }

    const messageId = message.key?.id;

    if (processedMessages.has(messageId)) {
      console.log(`[${requestId}] ⚠️ Mensagem duplicada ignorada`);
      return res.sendStatus(200);
    }

    processedMessages.add(messageId);

    const from = message.key?.remoteJid;
    const fromMe = message.key?.fromMe;

    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";

    console.log(`[${requestId}] 📩 TEXTO:`, text);
    console.log(`[${requestId}] 📌 FROM:`, from);
    console.log(`[${requestId}] 📌 fromMe:`, fromMe);

    // 🚫 ignora mensagens do próprio bot
    if (!fromMe) {
      console.log(`[${requestId}] 🚫 Ignorado (fromMe)`);
      return res.sendStatus(200);
    }

    // 🚫 ignora grupos
    if (from?.includes("@g.us")) {
      console.log(`[${requestId}] 🚫 Ignorado (grupo)`);
      return res.sendStatus(200);
    }

    // =========================
    // 📋 COMANDO LISTAR
    // =========================
    if (text.toLowerCase().startsWith("listar")) {
      const partes = text.trim().split(" ");
      const nome = partes[1];

      if (!nome) {
        await sendMessage(from, "❌ Informe o nome. Ex: listar Nome");
        return res.sendStatus(200);
      }

      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("*")
        .ilike("name", `%${nome}%`)
        .limit(1)
        .single();

      if (personError || !personData) {
        await sendMessage(from, "❌ Pessoa não encontrada");
        return res.sendStatus(200);
      }

      const { data: entries, error } = await supabase
        .from("entries")
        .select("*")
        .eq("person_id", personData.id)
        .order("created_at", { ascending: true });

      if (error || !entries.length) {
        await sendMessage(from, "❌ Nenhum registro encontrado");
        return res.sendStatus(200);
      }

      // 🔥 salva lista para deletar depois
      lastListedEntriesByChat.set(from, entries);

      const responsavel = entries[0].name;

      let total = 0;

      const lista = entries.map((item, index) => {
        const valor = item.value ?? item.amount ?? 0;
        total += valor;
        return `${index + 1} - ${item.description}: ${valor}`;
      });

      const mensagem = `
📊 *${responsavel}*

${lista.join("\n")}

💰 *Total:* ${total}
`.trim();

      await sendMessage(from, mensagem);

      return res.sendStatus(200);
    }

    // =========================
    // 🗑️ COMANDO DELETAR
    // =========================
    if (text.toLowerCase().startsWith("deletar")) {
      const partes = text.trim().split(" ");
      const indice = Number(partes[1]);

      if (!indice || indice < 1) {
        await sendMessage(from, "❌ Informe um índice válido. Ex: deletar 1");
        return res.sendStatus(200);
      }

      const listaSalva = lastListedEntriesByChat.get(from);

      if (!listaSalva || listaSalva.length === 0) {
        await sendMessage(from, "❌ Use 'listar' antes de deletar.");
        return res.sendStatus(200);
      }

      const item = listaSalva[indice - 1];

      if (!item) {
        await sendMessage(from, `❌ Índice ${indice} não encontrado.`);
        return res.sendStatus(200);
      }

      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.log(`[${requestId}] ❌ ERRO AO DELETAR:`, error);
        await sendMessage(from, "❌ Erro ao deletar item");
        return res.sendStatus(200);
      }

      await sendMessage(from, `✅ Item ${indice} deletado com sucesso.`);

      return res.sendStatus(200);
    }

    // =========================
    // 📄 COMANDO PDF
    // =========================
    if (text.toLowerCase().startsWith("pdf")) {
      const partes = text.trim().split(" ");
      const nome = partes[1];

      if (!nome) {
        await sendMessage(from, "❌ Informe o nome. Ex: pdf Nome");
        return res.sendStatus(200);
      }

      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("*")
        .ilike("name", `%${nome}%`)
        .limit(1)
        .single();

      if (personError || !personData) {
        await sendMessage(from, "❌ Pessoa não encontrada");
        return res.sendStatus(200);
      }

      const { data: entries, error } = await supabase
        .from("entries")
        .select("*")
        .eq("person_id", personData.id);

      if (error) {
        await sendMessage(from, "❌ Erro ao gerar PDF");
        return res.sendStatus(200);
      }

      const pdf = await generatePersonReportPdf({
        person: personData,
        entries
      });

      await sendMedia(from, pdf.filePath);

      return res.sendStatus(200);
    }

    // =========================
    // 🔍 PARSER NORMAL
    // =========================
    const parsed = parseMessage(text);

    if (parsed.error) {
      await sendMessage(from, `❌ ${parsed.error}`);
      return res.sendStatus(200);
    }

    const result = await createEntry(parsed);

    await sendMessage(
      from,
      `
✅ Registrado
📁 ${result[0].name}
✍🏻 ${result[0].description}
💰 ${formatCurrency(result[0].amount)}
`.trim()
    );

    res.sendStatus(200);

  } catch (error) {
    console.log(`[${requestId}] 💥 ERRO GERAL:`, error.message);
    console.error(error);
    res.sendStatus(500);
  }
}

module.exports = { webhook };