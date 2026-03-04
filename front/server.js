require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');

const app = express();

const PORT = process.env.PORT || 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(auth(config));

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() 
    ? `Tere ${req.oidc.user.name}! <a href="/logout">Logout</a>` 
    : 'Palun <a href="/login">Login</a>');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Rakendus tootab!',
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server tootab pordi ${PORT} peale`);
});

app.get('/payment-success', (req, res) => {
  res.send("Makse on edukas! 🎉 Aitäh tellimuse eest.");
});