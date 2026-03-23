const express = require('express');
const router = express.Router();
const { baixarPdfPessoa } = require('../controllers/reports.controller');

router.get('/:personName/pdf', baixarPdfPessoa);

module.exports = router;