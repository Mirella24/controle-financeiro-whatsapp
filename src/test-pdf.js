const { gerarRelatorioPorPessoa } = require('./services/report.service');

async function testar() {
  try {
    const relatorio = await gerarRelatorioPorPessoa('armando');

    if (!relatorio) {
      console.log('Nenhum lançamento encontrado.');
      return;
    }

    console.log('PDF gerado com sucesso!');
    console.log('Pessoa:', relatorio.nomePessoa);
    console.log('Arquivo:', relatorio.pdf.nomeArquivo);
    console.log('Caminho:', relatorio.pdf.caminhoArquivo);
    console.log('Total:', relatorio.pdf.total);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error.message);
  }
}

testar();