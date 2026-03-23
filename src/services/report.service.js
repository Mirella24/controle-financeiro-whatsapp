const db = require('../config/db');
const { normalizar } = require('../utils/normalize');
const { gerarPdfPessoa } = require('./pdf.service');

async function gerarRelatorioPorPessoa(nomeInformado) {
  const nomeNormalizado = normalizar(nomeInformado);

  const resultado = await db.query(
    `
    SELECT
      l.id,
      l.description,
      l.amount,
      l.launch_date,
      p.name AS person_name
    FROM launches l
    INNER JOIN people p ON p.id = l.person_id
    WHERE p.normalized_name = $1
    ORDER BY l.launch_date ASC, l.id ASC
    `,
    [nomeNormalizado]
  );

  if (!resultado.rows.length) {
    return null;
  }

  const nomePessoa = resultado.rows[0].person_name;
  const pdf = await gerarPdfPessoa(nomePessoa, resultado.rows);

  return {
    nomePessoa,
    lancamentos: resultado.rows,
    pdf
  };
}

module.exports = {
  gerarRelatorioPorPessoa
};