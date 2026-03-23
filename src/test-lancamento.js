const { parseMensagem } = require('./services/parser.service');
const { salvarLancamento } = require('./services/launch.service');

async function testar() {
  const mensagem = `
armando
cimento
100
15/03
`;

  try {
    const dados = parseMensagem(mensagem);

    if (dados.tipo !== 'lancamento') {
      throw new Error('Mensagem não foi reconhecida como lançamento.');
    }

    const resultado = await salvarLancamento({
      ...dados,
      rawText: mensagem.trim()
    });

    console.log('Pessoa:', resultado.pessoa);
    console.log('Lançamento:', resultado.lancamento);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testar();