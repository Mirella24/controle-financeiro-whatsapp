const { normalizar } = require('../utils/normalize');

function parseMensagem(texto) {
  if (!texto || typeof texto !== 'string') {
    return { tipo: 'ignorar' };
  }

  const bruto = texto.trim();
  const textoNormalizado = normalizar(bruto);

  if (textoNormalizado.startsWith('pdf ')) {
    const nome = bruto.slice(4).trim();

    if (!nome) {
      return { tipo: 'invalida', motivo: 'Nome não informado no comando PDF.' };
    }

    return {
      tipo: 'pdf',
      nome,
      nomeNormalizado: normalizar(nome)
    };
  }

  const linhas = bruto
    .split('\n')
    .map(linha => linha.trim())
    .filter(Boolean);

  if (linhas.length < 3) {
    return { tipo: 'ignorar' };
  }

  const [nome, descricao, valorTexto, dataTexto] = linhas;

  const valor = Number(valorTexto.replace(/\./g, '').replace(',', '.'));

  if (Number.isNaN(valor)) {
    return { tipo: 'invalida', motivo: 'Valor inválido.' };
  }

  return {
    tipo: 'lancamento',
    nome,
    nomeNormalizado: normalizar(nome),
    descricao,
    valor,
    dataTexto
  };
}

module.exports = {
  parseMensagem
};