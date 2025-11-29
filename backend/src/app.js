const express = require('express');
const cors = require('cors');

const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Use API routes
app.use('/api', appointmentRoutes);
app.use('/api', userRoutes);
app.use('/api', paymentRoutes);

// Export the app for server.js
module.exports = app;