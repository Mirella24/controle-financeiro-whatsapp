const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarTextoWhatsApp(to, body) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    body
  });
}

async function enviarPdfWhatsApp(to, mediaUrl, body = '') {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    body,
    mediaUrl: [mediaUrl]
  });
}

module.exports = {
  enviarTextoWhatsApp,
  enviarPdfWhatsApp
};