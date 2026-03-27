const { parseMensagem } = require('../services/parser.service');
const { salvarLancamento } = require('../services/launch.service');
const { gerarRelatorioPorPessoa } = require('../services/report.service');
const {
  enviarTexto,
  enviarDocumento,
  criarInstancia,
  conectarInstancia,
  configurarWebhook,
  buscarWebhook
} = require('../services/evolution.service');
const { baseUrl } = require('../config/env');
const { extrairNumeroWhatsApp } = require('../utils/normalize');

function extrairEvento(body) {
  return body?.event || body?.type || body?.data?.event || '';
}

function extrairMensagemTexto(body) {
  const payload = body?.data || body;
  const msg = payload?.message || payload?.messages?.[0]?.message || {};

  return (
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.imageMessage?.caption ||
    msg?.videoMessage?.caption ||
    msg?.documentMessage?.caption ||
    ''
  );
}

function extrairRemoteJid(body) {
  const payload = body?.data || body;
  return (
    payload?.key?.remoteJid ||
    payload?.messages?.[0]?.key?.remoteJid ||
    payload?.remoteJid ||
    ''
  );
}

function extrairFromMe(body) {
  const payload = body?.data || body;
  return Boolean(
    payload?.key?.fromMe ||
    payload?.messages?.[0]?.key?.fromMe ||
    false
  );
}

async function receberWebhookEvolution(req, res, next) {
  try {
    console.log('=== EVOLUTION WEBHOOK ===');
    console.log(JSON.stringify(req.body, null, 2));

    const evento = extrairEvento(req.body);

    if (evento && evento !== 'MESSAGES_UPSERT') {
      return res.status(200).json({ ok: true, ignoredEvent: evento });
    }

    const fromMe = extrairFromMe(req.body);
    if (fromMe) {
      return res.status(200).json({ ok: true, ignored: 'fromMe' });
    }

    const remoteJid = extrairRemoteJid(req.body);
    const numero = extrairNumeroWhatsApp(remoteJid);
    const texto = extrairMensagemTexto(req.body);

    if (!numero || !texto) {
      return res.status(200).json({ ok: true, ignored: 'no-number-or-text' });
    }

    const dados = parseMensagem(texto);

    if (dados.tipo === 'ignorar') {
      return res.status(200).json({ ok: true, ignored: 'parser-ignore' });
    }

    if (dados.tipo === 'invalida') {
      await enviarTexto(numero, `Mensagem inválida: ${dados.motivo}`);
      return res.status(200).json({ ok: true, handled: 'invalid' });
    }

    if (dados.tipo === 'lancamento') {
      const resultado = await salvarLancamento(dados, 'EVOLUTION');

      await enviarTexto(
        numero,
        `Lançamento salvo para ${resultado.pessoa.name}: ${resultado.lancamento.description} - R$ ${Number(resultado.lancamento.amount).toFixed(2)}`
      );

      return res.status(200).json({ ok: true, handled: 'launch' });
    }

    if (dados.tipo === 'pdf') {
      const relatorio = await gerarRelatorioPorPessoa(dados.nome);

      if (!relatorio) {
        await enviarTexto(numero, `Nenhum lançamento encontrado para ${dados.nome}.`);
        return res.status(200).json({ ok: true, handled: 'pdf-not-found' });
      }

      const mediaUrl = `${baseUrl}/public/pdfs/${relatorio.pdf.nomeArquivo}`;

      await enviarDocumento(
        numero,
        mediaUrl,
        relatorio.pdf.nomeArquivo,
        `Relatório de ${relatorio.nomePessoa}`
      );

      return res.status(200).json({ ok: true, handled: 'pdf' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('ERRO NO WEBHOOK EVOLUTION:', error.response?.data || error);
    next(error);
  }
}

async function setupEvolution(req, res, next) {
  try {
    let created;
    try {
      created = await criarInstancia();
    } catch (err) {
      created = { data: { note: 'instância pode já existir', detail: err.response?.data || err.message } };
    }

    const webhookUrl = `${baseUrl}/evolution/webhook`;
    const webhook = await configurarWebhook(webhookUrl);
    const qr = await conectarInstancia();

    return res.status(200).json({
      ok: true,
      webhookUrl,
      createInstance: created.data,
      webhook: webhook.data,
      qr: qr.data
    });
  } catch (error) {
    console.error('ERRO NO SETUP EVOLUTION:', error.response?.data || error);
    next(error);
  }
}

async function getWebhookEvolution(req, res, next) {
  try {
    const result = await buscarWebhook();
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('ERRO AO CONSULTAR WEBHOOK:', error.response?.data || error);
    next(error);
  }
}

module.exports = {
  receberWebhookEvolution,
  setupEvolution,
  getWebhookEvolution
};