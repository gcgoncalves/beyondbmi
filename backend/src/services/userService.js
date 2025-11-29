const User = require('../models/User');

const getUserAppointments = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { success: false, message: 'User not found.' };
  }
  return { success: true, appointments: user.bookings };
};

module.exports = {
  getUserAppointments,
};
