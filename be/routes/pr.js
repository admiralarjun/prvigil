const express = require('express');
const { analysispr } = require("../controllers/Analyze-pr.controller.js");
const router = express.Router();

router.post('/analyze-pr', analysispr);

module.exports = router;