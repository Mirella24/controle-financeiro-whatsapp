const express = require('express');
const router = express.Router();
const { verificarWebhook, receberWebhook } = require('../controllers/webhook.controller');

router.get('/whatsapp', verificarWebhook);
router.post('/whatsapp', receberWebhook);

module.exports = router;