import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentnow';

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const users = await User.find({}, 'email isVerified name');
    console.log('Registered Users:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
