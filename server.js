const express = require('express');
const oauthServer = require('oauth2-server');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data (replace with actual data in production)
const clients = [
    { id: '111', secret: '222aaaaaccccc', redirectUris: ['http://localhost:3000/auth/dashboard'] ,grants: ['authorization_code', 'client_credentials']}
];

const users = [
    { id: 1, username: 'test_user', password: 'test_password' },
];

const axios = require('axios');

const oauth = new oauthServer({
    model: {
        getClient: (clientId, clientSecret, callback) => {
            const client = clients.find(c => c.id === clientId && c.secret === clientSecret);
            if (!client) return callback('Invalid client');
            return callback(null, client);
        },
        grantTypeAllowed: (clientId, grantType, callback) => {
            // All grant types are allowed for simplicity (should be restricted in production)
            return callback(null, true);
        },
        getUser: (username, password, callback) => {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) return callback('Invalid user');
            return callback(null, user);
        },
        saveToken: (token, client, user, callback) => {
            // Mock implementation, should save token in database in production
            return callback(null);
        },
        getAuthorizationCode: (code, callback) => {
            // Calculate expiration time
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 30); // Expires in 30 minutes

            // Mock implementation, replace with actual logic to retrieve the authorization code
            return callback(null, {
                authorizationCode: code,
                expiresAt: expirationTime, // Set the expiration date/time for the authorization code
                redirectUri: 'http://localhost:3000/auth/dashboard', // Set the redirect URI associated with the code
                client: {
                    id: '111', // Client ID associated with the authorization code
                    redirectUris: ['http://localhost:3000/auth/dashboard'], // Client's redirect URIs
                },
                user: {
                    id: '1', // User ID associated with the authorization code
                },
            });
        },
        revokeAuthorizationCode: (code, callback) => {
            // Mock implementation, replace with actual logic to revoke the authorization code
            return callback(null, true); // Assume successful revocation
        },
    },
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
        const request = new oauthServer.Request(req);
        const response = new oauthServer.Response(res);

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
