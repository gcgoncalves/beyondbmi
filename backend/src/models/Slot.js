const mongoose = require('mongoose');

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

module.exports = mongoose.model('Slot', slotSchema);
