const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/appointments', userController.getUserAppointments);

module.exports = router;
