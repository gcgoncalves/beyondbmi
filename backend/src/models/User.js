const mongoose = require('mongoose');

// Mongoose Schema for Users
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bookings: [{
    date: { type: String, required: true },
    time: { type: String, required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' } // Reference to the booked slot
  }],
});

module.exports = mongoose.model('User', userSchema);
