const axios = require('axios');

const oauthConfig = {
    clientID: '111',
    clientSecret: '222aaaaaccccc',
    authorizationURL: 'http://localhost:3001/oauth/authorize',
    tokenURL: 'http://localhost:3001/oauth/token', // Updated to the local server's token URL
    callbackURL: 'http://localhost:3000/auth/callback',
};

async function login(req, res) {
    const redirectURL = `${oauthConfig.authorizationURL}?client_id=${oauthConfig.clientID}&redirect_uri=${oauthConfig.callbackURL}&response_type=code`;
    res.redirect(redirectURL);
    console.log("frontend redirect url", redirectURL);
}

async function callback(req, res) {
    const { code } = req.query;
    console.log("code", code)

    try {
        const response = await axios.post(oauthConfig.tokenURL,
            `client_id=${encodeURIComponent(oauthConfig.clientID)}&` +
            `client_secret=${encodeURIComponent(oauthConfig.clientSecret)}&` +
            `code=${encodeURIComponent(code)}&` +
            `grant_type=authorization_code&` +
            `redirect_uri=${encodeURIComponent('http://localhost:3000/auth/dashboard')}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });


        const accessToken = response.data.access_token;
        console.log("axiosResponse", response);

        // Redirect to dashboard or another route with access token
        //res.redirect(`/dashboard?access_token=${accessToken}`);
    } catch (error) {
        console.error("Error exchanging code for access token:", error);
        res.status(500).send('Error exchanging code for access token');
    }
}

module.exports = { login, callback };
