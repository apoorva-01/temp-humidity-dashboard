import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { signToken } from '../../../utils/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { name, password } = req.body;

    // Validate input
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name and password are required'
      });
    }

    // Connect to database
    await db.connect();
    
    // Find user
    const user = await User.findOne({ name });
    
    if (!user) {
      await db.disconnect();
      return res.status(401).json({
        success: false,
        error: 'Invalid name or password'
      });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      await db.disconnect();
      return res.status(401).json({
        success: false,
        error: 'Invalid name or password'
      });
    }

    // Generate token
    const token = signToken(user);
    
    // Set token as HTTP-only cookie
    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    }));
    
    // Disconnect from database
    await db.disconnect();

    // Return success response
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.isAdmin ? 'admin' : user.isSuperAdmin ? 'superadmin' : 'user',
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
      token
    });

  } catch (error) {
    console.error('Login API error:', error);
    
    // Ensure database disconnection
    try {
      await db.disconnect();
    } catch (disconnectError) {
      console.error('Database disconnect error:', disconnectError);
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
