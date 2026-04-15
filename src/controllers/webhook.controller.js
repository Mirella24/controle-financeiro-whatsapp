import { parseIncomingMessage } from '../services/message-parser.service.js';
import { findOrCreatePerson } from '../services/people.service.js';
import { createEntry, listEntriesByPerson } from '../services/entries.service.js';
import { sendTextMessage, sendDocumentMessage } from '../services/evolution.service.js';
import { generatePersonReportPdf } from '../services/pdf.service.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDateBR } from '../utils/formatDate.js';

const RESPONSE_NUMBER = '5518991391889';

function extractMessageData(body) {
  const event = body?.event || '';
  const data = body?.data || {};

  const text =
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.message?.imageMessage?.caption ||
    data?.message?.videoMessage?.caption ||
    data?.body ||
    '';

  const remoteJid =
    data?.key?.remoteJid ||
    data?.remoteJid ||
    data?.jid ||
    '';

  const remoteJidAlt =
    data?.key?.remoteJidAlt ||
    data?.remoteJidAlt ||
    data?.sender ||
    data?.senderPn ||
    data?.participantAlt ||
    '';

  const fromMe = data?.key?.fromMe || data?.fromMe || false;

  return {
    event,
    text,
    remoteJid,
    remoteJidAlt,
    fromMe
  };
}

function normalizeEventName(event = '') {
  return String(event).trim().toLowerCase();
}

export async function evolutionWebhook(req, res) {
  try {
    const { event, text, remoteJid, remoteJidAlt, fromMe } = extractMessageData(req.body);
    const normalizedEvent = normalizeEventName(event);

    console.log('======================================');
    console.log('Nova mensagem recebida no webhook');
    console.log('event:', event);
    console.log('remoteJid:', remoteJid);
    console.log('remoteJidAlt:', remoteJidAlt);
    console.log('fromMe:', fromMe);
    console.log('text:', text);

    if (normalizedEvent && normalizedEvent !== 'messages.upsert') {
      return res.status(200).json({
        ok: true,
        message: `Evento ignorado: ${event}`
      });
    }

    if (!text || !remoteJid) {
      return res.status(200).json({
        ok: true,
        message: 'Webhook recebido sem mensagem útil'
      });
    }

    if (remoteJid.includes('@g.us')) {
      return res.status(200).json({
        ok: true,
        message: 'Mensagem de grupo ignorada'
      });
    }

    const parsed = parseIncomingMessage(text);
    console.log('parsed:', parsed);

    if (parsed.type === 'invalid') {
      return res.status(200).json({
        ok: true,
        message: 'Mensagem ignorada por não estar no formato do sistema'
      });
    }

    if (parsed.type === 'report') {
      const person = await findOrCreatePerson(parsed.name);
      const entries = await listEntriesByPerson(person.id);

      const { fileName, filePath } = await generatePersonReportPdf({
        person,
        entries
      });

      await sendTextMessage({
        number: RESPONSE_NUMBER,
        text: `Relatório de ${person.name} gerado com sucesso. Enviando PDF...`
      });

      await sendDocumentMessage({
        number: RESPONSE_NUMBER,
        filePath,
        fileName,
        caption: `Relatório financeiro de ${person.name}`
      });

      return res.status(200).json({
        ok: true,
        message: 'Relatório gerado e enviado com sucesso'
      });
    }

    if (parsed.type === 'entry') {
      const person = await findOrCreatePerson(parsed.name);

      await createEntry({
        personId: person.id,
        description: parsed.description,
        amount: parsed.amount,
        entryDate: parsed.entryDate
      });

      const replyText = `Lançamento salvo com sucesso.

Responsável: ${person.name}
Descrição: ${parsed.description}
Valor: ${formatCurrency(parsed.amount)}
Data: ${formatDateBR(parsed.entryDate)}`;

      await sendTextMessage({
        number: RESPONSE_NUMBER,
        text: replyText
      });

      return res.status(200).json({
        ok: true,
        message: 'Lançamento processado com sucesso'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Nenhuma ação executada'
    });
  } catch (error) {
    console.error('Erro no webhook Evolution:');
    console.error(error?.response?.data || error.message);

    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}