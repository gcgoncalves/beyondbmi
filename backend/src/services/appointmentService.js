const Slot = require('../models/Slot');
const User = require('../models/User'); // Will be needed for booking updates

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
  await Slot.insertMany(slotsToCreate, { ordered: false })
    .catch(error => {
      if (error.code !== 11000) {
        console.error("Error creating default slots:", error);
      }
    });
};

const getAvailableAppointments = async (date) => {
  const requestedDateStr = date || get_current_date();
  const todayStr = get_current_date();

  if (requestedDateStr < todayStr) {
    throw new Error('Cannot request appointments for a past date.');
  }

  await createDefaultSlotsForDay(requestedDateStr);

  const availableSlots = await Slot.find({
    date: requestedDateStr,
    isBooked: false,
  }).select('time -_id').lean();

  return availableSlots;
};

const bookAppointment = async (date, time, userName, userEmail) => {
  const updatedSlot = await Slot.findOneAndUpdate(
    { date, time, isBooked: false },
    { $set: { isBooked: true, userName, userEmail } },
    { new: true }
  );

  if (updatedSlot) {
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({ email: userEmail, name: userName, bookings: [] });
    }
    user.bookings.push({ date, time, slotId: updatedSlot._id });
    await user.save();
    return { success: true, message: `Slot ${time} on ${date} booked successfully for ${userName}.` };
  } else {
    return { success: false, message: `Slot ${time} on ${date} is already booked or does not exist.` };
  }
};

const cancelAppointment = async (date, time) => {
  const updatedSlot = await Slot.findOneAndUpdate(
    { date, time, isBooked: true },
    { $set: { isBooked: false, userName: null, userEmail: null } },
    { new: true }
  );

  if (updatedSlot) {
    await User.findOneAndUpdate(
      { email: updatedSlot.userEmail },
      { $pull: { bookings: { slotId: updatedSlot._id } } }
    );
    return { success: true, message: `Booking for ${time} on ${date} cancelled successfully.` };
  } else {
    return { success: false, message: `No active booking found for ${time} on ${date}.` };
  }
};


module.exports = {
  getAvailableAppointments,
  bookAppointment,
  cancelAppointment,
};