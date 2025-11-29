const appointmentService = require('../services/appointmentService');
const userService = require('../services/userService'); // For booking updates

const getAppointments = async (req, res) => {
  try {
    const date = req.query.date;
    const availableSlots = await appointmentService.getAvailableAppointments(date);
    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    if (error.message.includes('past date')) {
        return res.status(422).json({ error: error.message, code: 'invalid_input' });
    }
    res.status(500).json({ message: 'Internal server error while fetching appointments.' });
  }
};

const bookAppointment = async (req, res) => {
  const { date, time, userName, userEmail } = req.body;

  if (!date || !time || !userName || !userEmail) {
    return res.status(400).json({ message: 'Missing booking details.' });
  }

  try {
    const result = await appointmentService.bookAppointment(date, time, userName, userEmail);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(409).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Internal server error while booking slot.' });
  }
};

const cancelAppointment = async (req, res) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required to cancel booking.' });
  }

  try {
    const result = await appointmentService.cancelAppointment(date, time);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Internal server error while cancelling booking.' });
  }
};

module.exports = {
  getAppointments,
  bookAppointment,
  cancelAppointment,
};