import mongoose from 'mongoose';
import app from './app';

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentnow';

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connection established successfully.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start Express Server
const server = app.listen(port, () => {
  console.log(`RentNow server is running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Unhandled Rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err?.name, err?.message);
  server.close(() => {
    process.exit(1);
  });
});
