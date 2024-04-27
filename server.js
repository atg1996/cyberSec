const express = require('express');
const OauthServer = require('oauth2-server');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));



const users = [
    { id: 1, username: 'test_user', password: 'test_password' },
];

const localModal = require('./model.js')

const oauth = new OauthServer({
    model: localModal,
    accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
    allowEmptyState: true,
    allowExtendedTokenAttributes: true,
});

// Authorization endpoint
app.get('/oauth/authorize', (req, res) => {
    // Render the authorization form
    res.send(`
        <form method="POST" action="/oauth/authorize">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username"><br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
    `);
});

// Handle authorization form submission
app.post('/oauth/authorize', (req, res) => {
    // Validate username and password (replace with actual validation logic)
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        console.log('Invalid credentials')
        return res.send('Invalid credentials');
    }

    // Generate authorization code
    const authorizationCode = crypto.randomBytes(16).toString('hex');

    console.log("authorizationCode",authorizationCode)

    // Store the code in the user's session or temporary storage
    //req.session.authorizationCode = authorizationCode;

    // Redirect to the client's callback URL with the authorization code
    res.redirect(`http://localhost:3000/auth/callback?code=${authorizationCode}`);
});

// OAuth token endpoint
app.post('/oauth/token', (req, res) => {
    console.log("request body",req.body)
    try {
        const request = new OauthServer.Request(req);
        const response = new OauthServer.Response(res);

        oauth.token(request, response)
            .then(token => {
                console.log("token", token);
                res.json(token);
            })
            .catch(err => {
                console.error("Token error:", err);
                res.status(err.code || 500).json(err);
            });
    } catch (error) {
        console.log("Arrrrivaaaaaa")
        console.log(error)
    }




});


// Start the server
app.listen(PORT, () => {
    console.log(`OAuth server is running on port ${PORT}`);
});
