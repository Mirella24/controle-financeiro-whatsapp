const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SERVER OK');
});

app.post('/twilio/whatsapp', (req, res) => {
  console.log('TWILIO BATEU AQUI');
  console.log('BODY:', req.body);

  return res.status(200).json({
    ok: true,
    recebido: true,
    body: req.body
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});