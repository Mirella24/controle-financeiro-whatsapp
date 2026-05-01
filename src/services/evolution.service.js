const axios = require("axios");

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

async function sendMessage(to, message) {
  try {
    const number = to.split("@")[0].trim();

    await axios.post(
      `http://212.192.2.44:8080/message/sendText/mirella`,
      {
        number: "5518991391889",
        textMessage: {
          text: message
        }
      },
      {
        headers: {
          apikey: "123456",
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.log("❌ ERRO AO ENVIAR MENSAGEM:");
    console.log(JSON.stringify(error.response?.data, null, 2));
  }
}

module.exports = { sendMessage };