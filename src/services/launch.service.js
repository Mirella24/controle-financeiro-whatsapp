const db = require('../config/db');

async function buscarOuCriarPessoa(nome, nomeNormalizado) {
  const pessoaExistente = await db.query(
    'SELECT * FROM people WHERE normalized_name = $1 LIMIT 1',
    [nomeNormalizado]
  );

  if (pessoaExistente.rows.length > 0) {
    return pessoaExistente.rows[0];
  }

  const novaPessoa = await db.query(
    `
    INSERT INTO people (name, normalized_name)
    VALUES ($1, $2)
    RETURNING *
    `,
    [nome, nomeNormalizado]
  );

  return novaPessoa.rows[0];
}

function converterDataOuUsarHoje(dataTexto) {
  if (!dataTexto) {
    return new Date().toISOString().split('T')[0];
  }

  const match = dataTexto.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/);

  if (!match) {
    throw new Error('Data inválida.');
  }

  const dia = match[1];
  const mes = match[2];
  const ano = match[3] || new Date().getFullYear();

  return `${ano}-${mes}-${dia}`;
}

async function salvarLancamento(dados, origem = 'TWILIO') {
  const pessoa = await buscarOuCriarPessoa(dados.nome, dados.nomeNormalizado);
  const dataFinal = converterDataOuUsarHoje(dados.dataTexto);

  const resultado = await db.query(
    `
    INSERT INTO launches (
      person_id,
      description,
      amount,
      launch_date,
      source_group_id,
      raw_text
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      pessoa.id,
      dados.descricao,
      dados.valor,
      dataFinal,
      origem,
      dados.rawText || null
    ]
  );

  return {
    pessoa,
    lancamento: resultado.rows[0]
  };
}

module.exports = {
  salvarLancamento
};