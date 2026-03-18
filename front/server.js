// Подключаем зависимости
require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');
const PocketBase = require('pocketbase/cjs'); // SDK PocketBase

const app = express();
const PORT = process.env.PORT || 3000;

const TURVAKOOD = "123456";

// --- Настройка Auth0 ---
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(auth(config));

// --- Подключение к PocketBase ---
const pb = new PocketBase(process.env.PB_URL);

// --- Маршрут главной страницы ---
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.send(`
      <h1>Tere ${req.oidc.user.name}!</h1>
      <a href="/logout">Logout</a>
      <hr>
      <p><a href="/grades">Vaata hinnetabelit</a></p>
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

// --- Маршрут для здоровья сервера ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Rakendus tootab!',
    uptime: process.uptime()
  });
});

// --- Маршрут для успешной оплаты ---
app.get('/payment-success', (req, res) => {
  res.send("Makse on edukas! 🎉 Aitäh tellimuse eest.");
});

// --- Маршрут для таблицы оценок ---
app.get('/grades', async (req, res) => {
  try {
    // Получаем все записи из коллекции "grades"
    const records = await pb.collection('grades').getFullList();

    // Формируем HTML таблицу
    let html = `
      <h1>Kursantide hinnete tabel</h1>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Student Name</th>
          <th>Subject</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
    `;

    records.forEach(record => {
      html += `
        <tr>
          <td>${record.student_name}</td>
          <td>${record.subject}</td>
          <td>${record.score}</td>
          <td>${record.status}</td>
        </tr>
      `;
    });

    html += '</table>';
    res.send(html);
  } catch (err) {
    console.error('Error fetching grades:', err);
    res.send('<h2>Viga andmebaasi ühendamisel. Palun proovi hiljem uuesti.</h2>');
  }
});

// --- Запуск сервера ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server tootab pordi ${PORT} peale`);
});
