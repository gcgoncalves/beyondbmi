const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return paymentIntent;
};

module.exports = {
  createPaymentIntent,
};
