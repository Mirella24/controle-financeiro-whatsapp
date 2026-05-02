const axios = require("axios");
const fs = require("fs");


// =========================
// 📩 ENVIAR TEXTO
// =========================
async function sendMessage(to, message) {
  try {
    const number = to.split("@")[0];

    await axios.post(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
      {
        number: process.env.PHONE_NUMBER,
        textMessage: {
          text: message
        }
      },
      {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // console.log("📤 Mensagem enviada");
  } catch (error) {
    // console.log("❌ ERRO AO ENVIAR MENSAGEM:");

    if (error.response) {
      // console.log("API ERROR:", JSON.stringify(error.response.data, null, 2));
    } else {
      // console.log("NODE ERROR:", error.message);
    }
  }
}

// =========================
// 📄 ENVIAR PDF (DOCUMENTO)
// =========================
async function sendMedia(to, filePath) {
  try {
    const number = to.split("@")[0];

    // console.log("📂 Lendo arquivo:", filePath);

    // 🔥 converter PDF para base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString("base64");

    // console.log("📦 Base64 gerado com sucesso");

    await axios.post(
      `${process.env.EVOLUTION_API_URL}/message/sendMedia/${process.env.EVOLUTION_INSTANCE}`,
      {
        number: process.env.PHONE_NUMBER,
        mediaMessage: {
          mediatype: "document",
          media: base64,
          fileName: "relatorio.pdf",
          caption: "📄 Seu relatório"
        }
      },
      {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // console.log("📤 PDF enviado com sucesso");
  } catch (error) {
    // console.log("❌ ERRO AO ENVIAR PDF:");

    if (error.response) {
      // console.log("API ERROR:", JSON.stringify(error.response.data, null, 2));
    } else {
      // console.log("NODE ERROR:", error.message);
    }
  }
}

module.exports = { sendMessage, sendMedia };