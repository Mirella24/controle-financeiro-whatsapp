import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export async function sendTextMessage({ number, text }) {
  if (!env.evolutionApiUrl || !env.evolutionApiKey || !env.evolutionInstance) {
    throw new Error('Evolution API não configurada no .env');
  }

  const url = `${env.evolutionApiUrl}/message/sendText/${env.evolutionInstance}`;

  const payload = {
    number,
    textMessage: {
      text
    }
  };

  const headers = {
    apikey: env.evolutionApiKey,
    'Content-Type': 'application/json'
  };

  console.log('Enviando resposta para WhatsApp:', {
    url,
    payload
  });

  const { data } = await axios.post(url, payload, { headers });

  console.log('Resposta da Evolution ao enviar mensagem:', data);

  return data;
}

export async function sendDocumentMessage({
  number,
  filePath,
  fileName,
  caption = ''
}) {
  if (!env.evolutionApiUrl || !env.evolutionApiKey || !env.evolutionInstance) {
    throw new Error('Evolution API não configurada no .env');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
  const mimetype = 'application/pdf';

  const url = `${env.evolutionApiUrl}/message/sendMedia/${env.evolutionInstance}`;

  const payload = {
    number,
    mediaMessage: {
      mediatype: 'document',
      mimetype,
      fileName,
      caption,
      media: fileBase64
    }
  };

  const headers = {
    apikey: env.evolutionApiKey,
    'Content-Type': 'application/json'
  };

  console.log('Enviando PDF para WhatsApp:', {
    url,
    number,
    fileName
  });

  const { data } = await axios.post(url, payload, { headers });

  console.log('Resposta da Evolution ao enviar PDF:', data);

  return data;
}