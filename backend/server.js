require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors'); // Import cors
const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware
app.use(express.json());

// /api/appointments route
app.get('/api/appointments', (req, res) => {
  const slots = [];
  for (let i = 9; i <= 17; i++) {
    slots.push({ time: `${i.toString().padStart(2, '0')}:00` });
  }
  res.json(slots);
});

// /api/book route
app.post('/api/book', (req, res) => {
  console.log('Booking request received:', req.body);
  res.status(200).send('Booking successful');
});

// /api/pay route
app.post('/api/pay', async (req, res) => {
  const fixedAmount = 5000; // 50 EUR in cents
  const fixedCurrency = 'eur';
  console.log(`Received payment request. Fixed amount: ${fixedAmount}, fixed currency: ${fixedCurrency}`);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: fixedAmount,
      currency: fixedCurrency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log('PaymentIntent created:', paymentIntent.id);

    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.error('Error creating PaymentIntent:', e.message);
    res.status(400).json({
      error: e.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
