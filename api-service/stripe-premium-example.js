require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const PocketBase = require('pocketbase/cjs');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pb = new PocketBase(process.env.POCKETBASE_URL);

async function ensurePocketBaseAdminAuth() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD
    );
  }
}

app.post('/api/billing/create-checkout-session', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe checkout create error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session?.metadata?.userId;

        if (userId) {
          await ensurePocketBaseAdminAuth();
          await pb.collection('users').update(userId, { isPremium: true });
        }
      }

      return res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Stripe premium example listening on :${PORT}`);
});
