import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentnow';

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
    const user = await User.findOne({ email: 'admin@rentnow.com' });
    if (!user) {
      console.log('User not found!');
      return;
    }
    console.log('User passwordHash:', user.passwordHash);
    const isMatch = await bcrypt.compare('admin123', user.passwordHash);
    console.log('Does password admin123 match?:', isMatch);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
