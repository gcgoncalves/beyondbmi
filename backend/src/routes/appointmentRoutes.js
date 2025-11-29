const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/appointments', appointmentController.getAppointments);
router.post('/book', appointmentController.bookAppointment);
router.post('/cancel-booking', appointmentController.cancelAppointment);

module.exports = router;
