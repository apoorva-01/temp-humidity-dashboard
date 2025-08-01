import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isSuperAdmin: { type: Boolean, required: true, default: false },
    email: { type: String, required: false, unique: true },
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema,'users');
export default User;
