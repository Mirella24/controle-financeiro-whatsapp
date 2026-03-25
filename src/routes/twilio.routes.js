const express = require('express');
const router = express.Router();

router.post('/whatsapp', (req, res) => {
  console.log('POST /twilio/whatsapp chegou');
  return res.status(200).json({
    ok: true,
    body: req.body
  });
});

module.exports = router;