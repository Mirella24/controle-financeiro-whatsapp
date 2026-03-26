const twilio = require('twilio');
const { twilio: twilioEnv } = require('../config/env');

const client = twilio(twilioEnv.accountSid, twilioEnv.authToken);

async function enviarTextoWhatsApp(to, body) {
  return client.messages.create({
    from: twilioEnv.from,
    to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    body
  });
}

async function enviarPdfWhatsApp(to, mediaUrl, body = '') {
  return client.messages.create({
    from: twilioEnv.from,
    to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    body,
    mediaUrl: [mediaUrl]
  });
}

module.exports = {
  enviarTextoWhatsApp,
  enviarPdfWhatsApp
};