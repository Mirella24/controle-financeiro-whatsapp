const express = require('express');
const router = express.Router();

router.post('/whatsapp', (req, res) => {
  return res.status(200).json({
    ok: true,
    rota: '/twilio/whatsapp',
    body: req.body
  });
});

module.exports = router;