const express = require('express');
const router = express.Router();
const { receberTwilioWebhook } = require('../controllers/twilio.controller');

router.post('/whatsapp', receberTwilioWebhook);

module.exports = router;