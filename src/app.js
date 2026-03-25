const express = require('express');
const path = require('path');
const healthRoutes = require('./routes/health.routes');
const reportsRoutes = require('./routes/reports.routes');
const twilioRoutes = require('./routes/twilio.routes');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TESTE RENDER 999');
});

app.post('/teste-post', (req, res) => {
  return res.status(200).json({
    ok: true,
    mensagem: 'POST funcionando'
  });
});

app.use('/public/pdfs', express.static(path.resolve(process.cwd(), 'storage', 'pdfs')));

app.use('/health', healthRoutes);
app.use('/reports', reportsRoutes);
app.use('/twilio', twilioRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;