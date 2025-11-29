const mongoose = require('mongoose');
const app = require('./src/app'); // Import the configured Express app

const port = 3000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondbmi';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
});
