const express = require('express');
const router = express.Router();
const oauthHandlers = require('../handlers/oauthHandlers');


router.get('/login', oauthHandlers.login);


router.get('/callback', oauthHandlers.callback);

module.exports = router;
