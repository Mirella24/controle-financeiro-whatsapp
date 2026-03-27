const express = require('express');
const router = express.Router();
const {
  receberWebhookEvolution,
  setupEvolution,
  getWebhookEvolution
} = require('../controllers/evolution.controller');

router.post('/webhook', receberWebhookEvolution);
router.post('/setup', setupEvolution);
router.get('/webhook', getWebhookEvolution);

module.exports = router;