// See https://oauth2-server.readthedocs.io/en/latest/model/spec.html for what you can do with this
const crypto = require('crypto')

// Mock data (replace with actual data in production)
const clients = [
    { id: '111', secret: '222aaaaaccccc', redirectUris: ['http://localhost:3000/auth/dashboard'] ,grants: ['authorization_code', 'client_credentials']}
];

// TODO import it from a single place
const users = [
    { id: 1, username: 'test_user', password: 'test_password' },
];

const db = { // Here is a fast overview of what your db model should look like
    authorizationCode: {
        authorizationCode: '', // A string that contains the code
        expiresAt: new Date(), // A date when the code expires
        redirectUri: '', // A string of where to redirect to with this code
        client: null, // See the client section
        user: null, // Whatever you want... This is where you can be flexible with the protocol
    },
    client: { // Application wanting to authenticate with this server
        clientId: '', // Unique string representing the client
        clientSecret: '', // Secret of the client; Can be null
        grants: [], // Array of grants that the client can use (ie, `authorization_code`)
        redirectUris: [], // Array of urls the client is allowed to redirect to
    },
    token: {
        accessToken: '', // Access token that the server created
        accessTokenExpiresAt: new Date(), // Date the token expires
        client: null, // Client associated with this token
        user: null, // User associated with this token
    },
}


module.exports = {
    getAccessToken: token => {
        /* This is where you select the token from the database where the code matches */
        log({
            title: 'Get Access Token',
            parameters: [
                { name: 'token', value: token },
            ]
        })
        if (!token || token === 'undefined') return false
        return new Promise(resolve => resolve(db.token))
    },
    getRefreshToken: token => {
        /* Retrieves the token from the database */
        log({
            title: 'Get Refresh Token',
            parameters: [
                { name: 'token', value: token },
            ],
        })
        return new Promise(resolve => resolve(db.token))
    },
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
    generateAuthorizationCode: (client, user, scope) => {
        /*
        For this to work, you are going have to hack this a little bit:
        1. navigate to the node_modules folder
        2. find the oauth_server folder. (node_modules/express-oauth-server/node_modules/oauth2-server)
        3. open lib/handlers/authorize-handler.js
        4. Make the following change (around line 136):

        AuthorizeHandler.prototype.generateAuthorizationCode = function (client, user, scope) {
          if (this.model.generateAuthorizationCode) {
            // Replace this
            //return promisify(this.model.generateAuthorizationCode).call(this.model, client, user, scope);
            // With this
            return this.model.generateAuthorizationCode(client, user, scope)
          }
          return tokenUtil.generateRandomToken();
        };
        */

        log({
            title: 'Generate Authorization Code',
            parameters: [
                { name: 'client', value: client },
                { name: 'user', value: user },
            ],
        })

        const seed = crypto.randomBytes(256)
        return crypto
            .createHash('sha1')
            .update(seed)
            .digest('hex')
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
}

function log({ title, parameters }) {
    console.log(title, parameters)
}
