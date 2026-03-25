const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('SERVER OK');
});

app.post('/', (req, res) => {
  res.status(200).json({
    ok: true,
    rota: '/',
    body: req.body
  });
});

app.post('/abc', (req, res) => {
  res.status(200).json({
    ok: true,
    rota: '/abc',
    body: req.body
  });
});

app.post('/twilio/whatsapp', (req, res) => {
  res.status(200).json({
    ok: true,
    rota: '/twilio/whatsapp',
    body: req.body
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});