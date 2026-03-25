const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SERVER TESTE FINAL');
});

app.post('/twilio/whatsapp', (req, res) => {
  return res.status(200).json({
    ok: true,
    origem: 'server.js DIRETO',
    body: req.body
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});