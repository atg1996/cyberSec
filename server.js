const express = require('express');
const oauthServer = require('oauth2-server');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data (replace with actual data in production)
const clients = [
    { id: 'your_client_id', secret: 'your_client_secret', redirectUris: ['http://localhost:3000/auth/callback'] },
];

const users = [
    { username: 'test_user', password: 'test_password' },
];

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
    },
});

// OAuth token endpoint
app.post('/oauth/token', (req, res) => {
    console.log("arrivaaaa");
    const request = new oauthServer.Request(req);
    const response = new oauthServer.Response(res);

    oauth.token(request, response)
        .then(token => {
            res.json(token);
        })
        .catch(err => {
            res.status(err.code || 500).json(err);
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`OAuth server is running on port ${PORT}`);
});
