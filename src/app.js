const express = require('express');
const path = require('path');
const healthRoutes = require('./routes/health.routes');
const reportsRoutes = require('./routes/reports.routes');
const evolutionRoutes = require('./routes/evolution.routes');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API online');
});

app.use('/public/pdfs', express.static(path.resolve(process.cwd(), 'storage', 'pdfs')));

app.use('/health', healthRoutes);
app.use('/reports', reportsRoutes);
app.use('/evolution', evolutionRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Erro interno no servidor.'
  });
});

module.exports = app;