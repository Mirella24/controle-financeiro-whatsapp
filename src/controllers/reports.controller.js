const { gerarRelatorioPorPessoa } = require('../services/report.service');

async function baixarPdfPessoa(req, res, next) {
  try {
    const personName = req.params.personName;
    const relatorio = await gerarRelatorioPorPessoa(personName);

    if (!relatorio) {
      return res.status(404).json({
        error: 'Nenhum lançamento encontrado para essa pessoa.'
      });
    }

    return res.download(relatorio.pdf.caminhoArquivo, relatorio.pdf.nomeArquivo);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  baixarPdfPessoa
};