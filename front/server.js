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
  if (req.oidc.isAuthenticated()) {
    res.send(`
      <h1>Tere ${req.oidc.user.name}!</h1>
      <a href="/logout">Logout</a>
      <hr>
      <p>payment button</p>
      <!-- Stripe Buy Button -->
      <script async src="https://js.stripe.com/v3/buy-button.js"></script>
      <stripe-buy-button
        buy-button-id="buy_btn_1T7DZwHHsHnJ2AMPJOFWf9Jl"
        publishable-key="pk_test_51T7DBwHHsHnJ2AMPZSuAIjPx5cABFJHE283x5E3CTlDHjBiSXGa60QzEYdjHP6fu6xJBsVoKwfvUrWLxPOK8dboq00eAZgXzDQ"
      >
      </stripe-buy-button>
    `);
  } else {
    res.send('Palun <a href="/login">Login</a>');
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Rakendus tootab!',
    uptime: process.uptime()
  });
});

app.get('/payment-success', (req, res) => {
  res.send("Makse on edukas! 🎉 Aitäh tellimuse eest.");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server tootab pordi ${PORT} peale`);
});