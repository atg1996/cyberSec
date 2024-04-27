const express = require('express');
const router = express.Router();
const oauthHandlers = require('../handlers/oauthHandlers');


router.get('/login', oauthHandlers.login);


router.get('/callback', oauthHandlers.callback);
router.get('/dashboard', (req, res) => {
    res.send('<h1>You are logged in</h1>');
});

module.exports = router;
