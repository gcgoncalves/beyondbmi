require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const mongoose = require('mongoose'); // Import Mongoose
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondbmi';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema for Slots
const slotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  userName: { type: String, default: null },
  userEmail: { type: String, default: null },
  isBooked: { type: Boolean, default: false },
});

// Compound index to ensure uniqueness of slots
slotSchema.index({ date: 1, time: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);

// Helper to get current date in YYYY-MM-DD format
const get_current_date = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to create default slots for a day in DB
const createDefaultSlotsForDay = async (date) => {
  const slotsToCreate = [];
  for (let i = 9; i <= 17; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    slotsToCreate.push({ date, time, isBooked: false, userName: null, userEmail: null });
  }
  // Use insertMany with `ordered: false` to continue even if some docs already exist (e.g., from a previous run)
  await Slot.insertMany(slotsToCreate, { ordered: false })
    .catch(error => {
      // Ignore duplicate key errors (code 11000) which means slot already exists
      if (error.code !== 11000) {
        console.error("Error creating default slots:", error);
      }
    });
};


// /api/appointments route
app.get('/api/appointments', async (req, res) => {
  const requestedDateStr = req.query.date || get_current_date();
  const todayStr = get_current_date();

  // Past date validation
  if (requestedDateStr < todayStr) {
    return res.status(422).json({ error: 'Cannot request appointments for a past date.', code: 'invalid_input' });
  }

  try {
    // Ensure default slots exist for the requested date
    await createDefaultSlotsForDay(requestedDateStr);

    // Fetch available slots from MongoDB
    const availableSlots = await Slot.find({
      date: requestedDateStr,
      isBooked: false,
    }).select('time -_id').lean(); // Select only 'time' and exclude '_id'

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error while fetching appointments.' });
  }
});

// /api/book route
app.post('/api/book', async (req, res) => {
  const { date, time, userName, userEmail } = req.body;
  console.log(`Attempting to book slot: Date=${date}, Time=${time}, User=${userName}, Email=${userEmail}`);

  if (!date || !time || !userName || !userEmail) {
    return res.status(400).json({ message: 'Missing booking details.' });
  }

  try {
    const updatedSlot = await Slot.findOneAndUpdate(
      { date, time, isBooked: false }, // Find an unbooked slot
      { $set: { isBooked: true, userName, userEmail } }, // Set it as booked
      { new: true } // Return the updated document
    );

    if (updatedSlot) {
      return res.status(200).json({ message: `Slot ${time} on ${date} booked successfully for ${userName}.` });
    } else {
      return res.status(409).json({ message: `Slot ${time} on ${date} is already booked or does not exist.` });
    }
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Internal server error while booking slot.' });
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

// /api/cancel-booking route
app.post('/api/cancel-booking', async (req, res) => {
  const { date, time } = req.body;
  console.log(`Attempting to cancel booking for: Date=${date}, Time=${time}`);

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required to cancel booking.' });
  }

  try {
    const updatedSlot = await Slot.findOneAndUpdate(
      { date, time, isBooked: true }, // Find a booked slot
      { $set: { isBooked: false, userName: null, userEmail: null } }, // Set it as unbooked
      { new: true }
    );

    if (updatedSlot) {
      return res.status(200).json({ message: `Booking for ${time} on ${date} cancelled successfully.` });
    } else {
      return res.status(404).json({ message: `No active booking found for ${time} on ${date}.` });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Internal server error while cancelling booking.' });
  }
});

// Start Express server only after MongoDB connection is open
mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
});
