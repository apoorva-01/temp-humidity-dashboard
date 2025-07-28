import Router from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { signToken, isAuth } from '../../../utils/auth';

const handler = Router();
handler.use(isAuth);

handler.put(async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.user._id);
    if (!user) {
      await db.disconnect();
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    if (req.body.email && (!user.email || req.body.email.toLowerCase() !== user.email.toLowerCase())) {
      const email = req.body.email.toLowerCase();
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        await db.disconnect();
        return res.status(400).send({ success: false, message: 'Email already exists' });
      }
      user.email = req.body.email;
    }
    
    user.name = req.body.name || user.name;
    user.password = req.body.password
      ? bcrypt.hashSync(req.body.password)
      : user.password;
      
    const updatedUser = await user.save();
    await db.disconnect();

    const token = signToken(updatedUser);
    res.send({
      success: true,
      token,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error) {
    await db.disconnect().catch(e => console.error("DB disconnection failed in error handler", e));
    console.error('API Profile Update Error:', error);
    res.status(500).send({ success: false, message: 'An unexpected error occurred. Please try again.' });
  }
});

export default handler;
