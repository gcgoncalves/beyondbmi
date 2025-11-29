const paymentService = require('../services/paymentService');

const processPayment = async (req, res) => {
  const fixedAmount = 5000;
  const fixedCurrency = 'eur';

  try {
    const paymentIntent = await paymentService.createPaymentIntent(fixedAmount, fixedCurrency);
    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.error('Error creating PaymentIntent:', e.message);
    res.status(400).json({
      error: e.message,
    });
  }
};

module.exports = {
  processPayment,
};