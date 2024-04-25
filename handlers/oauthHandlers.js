const axios = require('axios');


const oauthConfig = {
    clientID: 'your_client_id',
    clientSecret: 'your_client_secret',
    authorizationURL: 'https://oauth-provider.com/authorize',
    tokenURL: 'https://oauth-provider.com/token',
    callbackURL: 'http://localhost:3000/auth/callback',
};


async function login(req, res) {
    const redirectURL = `${oauthConfig.authorizationURL}?client_id=${oauthConfig.clientID}&redirect_uri=${oauthConfig.callbackURL}&response_type=code`;
    res.redirect(redirectURL);
}


async function callback(req, res) {
    const { code } = req.query;

    // Exchange code for access token
    try {
        const response = await axios.post(oauthConfig.tokenURL, {
            client_id: oauthConfig.clientID,
            client_secret: oauthConfig.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: oauthConfig.callbackURL,
        });

        const accessToken = response.data.access_token;

        res.send(`Access Token: ${accessToken}`);
    } catch (error) {
        res.status(500).send('Error exchanging code for access token');
    }
}

module.exports = { login, callback };
