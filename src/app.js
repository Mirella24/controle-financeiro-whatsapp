const express = require('express');
const healthRoutes = require('./routes/health.routes');
const reportsRoutes = require('./routes/reports.routes');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/reports', reportsRoutes);
app.use('/webhooks', webhookRoutes);

module.exports = app;