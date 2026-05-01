const crypto = require("crypto");
const { parseMessage } = require("../utils/parser");
const { createEntry } = require("../services/entries.service");
const { sendMessage } = require("../services/evolution.service");

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

    // 🔍 parse
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