const db = require('./config/db');

async function testar() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Banco conectado:', result.rows[0]);
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
  }
}

testar();