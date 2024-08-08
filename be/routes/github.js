const express = require('express');
const {RepoSuggestion} = require('../controllers/Repo-suggestion.controller.js')
const {contributor} = require('../controllers/Contributers.controller.js')
const { Getpr } = require("../controllers/Get-pr.controller.js");
const router  = express.Router();

router.get('/repo-suggestions/:fullname',RepoSuggestion)
router.get('/contributors',contributor)
router.post('/get-prs', Getpr);

module.exports = router;
