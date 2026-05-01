const crypto = require("crypto");
const { parseMessage } = require("../utils/parser");
const { createEntry } = require("../services/entries.service");
const { sendMessage, sendMedia } = require("../services/evolution.service");
const { generatePersonReportPdf } = require("../services/pdf.service");
const { supabase } = require("../config/supabase");

const processedMessages = new Set();

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
    // 📄 COMANDO PDF
    // =========================
    if (text.toLowerCase().startsWith("pdf")) {
      console.log(`[${requestId}] 📄 Comando PDF detectado`);

      const partes = text.trim().split(" ");
      const nome = partes[1]; // pdf mirella

      if (!nome) {
        await sendMessage(from, "❌ Informe o nome. Ex: pdf mirella");
        return res.sendStatus(200);
      }

      console.log(`[${requestId}] 🔍 Buscando pessoa:`, nome);

      // buscar pessoa
      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("*")
        .ilike("name", `%${nome}%`)
        .limit(1)
        .single();

      if (personError || !personData) {
        console.log(`[${requestId}] ❌ Pessoa não encontrada`);
        await sendMessage(from, "❌ Pessoa não encontrada");
        return res.sendStatus(200);
      }

      console.log(`[${requestId}] 👤 Pessoa encontrada:`, personData);

      // buscar entries da pessoa
      const { data: entries, error } = await supabase
        .from("entries")
        .select("*")
        .eq("person_id", personData.id);

      if (error) {
        console.log(`[${requestId}] ❌ ERRO AO BUSCAR ENTRIES:`, error);
        await sendMessage(from, "❌ Erro ao gerar PDF");
        return res.sendStatus(200);
      }

      console.log(`[${requestId}] 📊 ENTRIES ENCONTRADOS:`, entries.length);

      console.log(`[${requestId}] 🛠️ Gerando PDF...`);

      const pdf = await generatePersonReportPdf({
        person: personData,
        entries
      });

      console.log(`[${requestId}] ✅ PDF GERADO:`, pdf.filePath);

      // 🔥 enviar PDF
      await sendMedia(from, pdf.filePath);

      return res.sendStatus(200);
    }

    // =========================
    // 🔍 PARSER NORMAL
    // =========================
    const parsed = parseMessage(text);

    console.log(`[${requestId}] 🔍 PARSED:`, parsed);

    if (parsed.error) {
      console.log(`[${requestId}] ❌ ERRO PARSER:`, parsed.error);
      await sendMessage(from, `❌ ${parsed.error}`);
      return res.sendStatus(200);
    }

    console.log(`[${requestId}] 💾 Enviando para o banco...`);

    const result = await createEntry(parsed);

    console.log(`[${requestId}] ✅ SALVO:`, result);

    await sendMessage(from, "✅ Lançamento salvo com sucesso!");

    res.sendStatus(200);

  } catch (error) {
    console.log(`[${requestId}] 💥 ERRO GERAL:`, error.message);
    console.error(error);
    res.sendStatus(500);
  }
}

module.exports = { webhook };