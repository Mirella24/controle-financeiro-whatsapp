const { parseMensagem } = require('../services/parser.service');
const { salvarLancamento } = require('../services/launch.service');
const { gerarRelatorioPorPessoa } = require('../services/report.service');
const {
  enviarTextoWhatsApp,
  enviarPdfWhatsApp
} = require('../services/twilio.service');
const { baseUrl } = require('../config/env');

async function receberTwilioWebhook(req, res, next) {
  try {
    const texto = req.body.Body || '';
    const from = req.body.From || '';
    const numMedia = Number(req.body.NumMedia || 0);

    console.log('Webhook Twilio recebido:', req.body);

    if (numMedia > 0) {
      return res.status(200).send('ok');
    }

    const dados = parseMensagem(texto);

    if (dados.tipo === 'ignorar') {
      return res.status(200).send('ok');
    }

    if (dados.tipo === 'invalida') {
      await enviarTextoWhatsApp(from, `Mensagem inválida: ${dados.motivo}`);
      return res.status(200).send('ok');
    }

    if (dados.tipo === 'lancamento') {
      const resultado = await salvarLancamento(dados, 'TWILIO');

      await enviarTextoWhatsApp(
        from,
        `Lançamento salvo para ${resultado.pessoa.name}: ${resultado.lancamento.description} - R$ ${Number(resultado.lancamento.amount).toFixed(2)}`
      );

      return res.status(200).send('ok');
    }

    if (dados.tipo === 'pdf') {
      const relatorio = await gerarRelatorioPorPessoa(dados.nome);

      if (!relatorio) {
        await enviarTextoWhatsApp(from, `Nenhum lançamento encontrado para ${dados.nome}.`);
        return res.status(200).send('ok');
      }

      const mediaUrl = `${baseUrl}/public/pdfs/${relatorio.pdf.nomeArquivo}`;

      await enviarPdfWhatsApp(
        from,
        mediaUrl,
        `Relatório de ${relatorio.nomePessoa}`
      );

      return res.status(200).send('ok');
    }

    return res.status(200).send('ok');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  receberTwilioWebhook
};