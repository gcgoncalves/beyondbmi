const userService = require('../services/userService');

const getUserAppointments = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required.' });
  }

  try {
    const result = await userService.getUserAppointments(email);
    if (result.success) {
      return res.json({ appointments: result.appointments });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: 'Internal server error while fetching user appointments.' });
  }
};

module.exports = {
  getUserAppointments,
};