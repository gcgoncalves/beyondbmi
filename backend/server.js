require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors'); // Import cors
const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware
app.use(express.json());

// In-memory database for slots
const inMemoryDb = {}; // Key: 'YYYY-MM-DD', Value: { '09:00': null, '10:00': 'email@example.com', ... }

// Helper to get current date in YYYY-MM-DD format
const get_current_date = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to create default slots for a day
const createDefaultSlots = () => {
  const slots = {};
  for (let i = 9; i <= 17; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    slots[time] = null; // null means free
  }
  return slots;
};

// /api/appointments route
app.get('/api/appointments', (req, res) => {
  const requestedDateStr = req.query.date || get_current_date();
  const todayStr = get_current_date();

  // Past date validation
  if (requestedDateStr < todayStr) {
    return res.status(422).json({ error: 'Cannot request appointments for a past date.', code: 'invalid_input' });
  }

  if (!inMemoryDb[requestedDateStr]) {
    inMemoryDb[requestedDateStr] = createDefaultSlots();
  }

  const dailySlots = inMemoryDb[requestedDateStr];
  const availableSlots = Object.keys(dailySlots)
    .filter(time => dailySlots[time] === null)
    .map(time => ({ time }));

  res.json(availableSlots);
});

// /api/book route
app.post('/api/book', (req, res) => {
  const { date, time, userName, userEmail } = req.body;
  console.log(`Attempting to book slot: Date=${date}, Time=${time}, User=${userName}, Email=${userEmail}`);

  if (!date || !time || !userName || !userEmail) {
    return res.status(400).json({ message: 'Missing booking details.' });
  }

  // Ensure the day exists in our in-memory DB
  if (!inMemoryDb[date]) {
    inMemoryDb[date] = createDefaultSlots();
  }

  const dailySlots = inMemoryDb[date];

  // Check if the slot is available
  if (dailySlots[time] === null) {
    dailySlots[time] = { userName, userEmail }; // Book the slot
    return res.status(200).json({ message: `Slot ${time} on ${date} booked successfully for ${userName}.` });
  } else {
    // Slot is already booked
    return res.status(409).json({ message: `Slot ${time} on ${date} is already booked.` });
  }
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

// New /api/cancel-booking route
app.post('/api/cancel-booking', (req, res) => {
  const { date, time } = req.body;
  console.log(`Attempting to cancel booking for: Date=${date}, Time=${time}`);

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required to cancel booking.' });
  }

  if (inMemoryDb[date] && inMemoryDb[date][time]) {
    inMemoryDb[date][time] = null; // Free up the slot
    return res.status(200).json({ message: `Booking for ${time} on ${date} cancelled successfully.` });
  } else {
    return res.status(404).json({ message: `No active booking found for ${time} on ${date}.` });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
