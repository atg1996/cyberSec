const express = require('express');
const oauthRouter = require('./routes/oauth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', oauthRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
