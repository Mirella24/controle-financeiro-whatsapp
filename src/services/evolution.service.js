const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://212.192.2.44:8080";
const INSTANCE = "mirella";
const API_KEY = "123456";

// =========================
// 📩 ENVIAR TEXTO
// =========================
async function sendMessage(to, message) {
  try {
    const number = to.split("@")[0];

    await axios.post(
      `${BASE_URL}/message/sendText/${INSTANCE}`,
      {
        number: "5518991391889",
        textMessage: {
          text: message
        }
      },
      {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("📤 Mensagem enviada");
  } catch (error) {
    console.log("❌ ERRO AO ENVIAR MENSAGEM:");

    if (error.response) {
      console.log("API ERROR:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("NODE ERROR:", error.message);
    }
  }
}

// =========================
// 📄 ENVIAR PDF (DOCUMENTO)
// =========================
async function sendMedia(to, filePath) {
  try {
    const number = to.split("@")[0];

    console.log("📂 Lendo arquivo:", filePath);

    // 🔥 converter PDF para base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString("base64");

    console.log("📦 Base64 gerado com sucesso");

    await axios.post(
      `${BASE_URL}/message/sendMedia/${INSTANCE}`,
      {
        number: "5518991391889",
        mediaMessage: {
          mediatype: "document",
          media: base64,
          fileName: "relatorio.pdf",
          caption: "📄 Seu relatório"
        }
      },
      {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("📤 PDF enviado com sucesso");
  } catch (error) {
    console.log("❌ ERRO AO ENVIAR PDF:");

    if (error.response) {
      console.log("API ERROR:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("NODE ERROR:", error.message);
    }
  }
}

module.exports = { sendMessage, sendMedia };