const axios = require('axios');
const { evolution } = require('../config/env');

const api = axios.create({
  baseURL: evolution.baseUrl,
  headers: {
    apikey: evolution.apiKey,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

async function enviarTexto(numero, texto) {
  return api.post(`/message/sendText/${evolution.instance}`, {
    number: numero,
    text: texto,
    delay: 1200,
    linkPreview: false
  });
}

async function enviarDocumento(numero, mediaUrl, fileName, caption = '') {
  return api.post(`/message/sendMedia/${evolution.instance}`, {
    number: numero,
    mediatype: 'document',
    mimetype: 'application/pdf',
    caption,
    media: mediaUrl,
    fileName,
    delay: 1200
  });
}

async function criarInstancia() {
  return api.post('/instance/create', {
    instanceName: evolution.instance,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
    number: ''
  });
}

async function conectarInstancia() {
  return api.get(`/instance/connect/${evolution.instance}`);
}

async function configurarWebhook(urlWebhook) {
  return api.post(`/webhook/set/${evolution.instance}`, {
    enabled: true,
    url: urlWebhook,
    webhookByEvents: false,
    webhookBase64: false,
    events: [
      'MESSAGES_UPSERT',
      'CONNECTION_UPDATE',
      'QRCODE_UPDATED'
    ]
  });
}

async function buscarWebhook() {
  return api.get(`/webhook/find/${evolution.instance}`);
}

module.exports = {
  enviarTexto,
  enviarDocumento,
  criarInstancia,
  conectarInstancia,
  configurarWebhook,
  buscarWebhook
};