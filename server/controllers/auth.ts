import { Request, Response } from 'express';
import { db } from '../../database/db.ts';
import { signToken } from '../utils/jwt.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { dispatchWhatsAppOtp } from '../services/whatsapp.ts';

export async function sendOtp(req: Request, res: Response) {
  try {
    const { whatsapp_number, purpose } = req.body;
    if (!whatsapp_number) {
      return res.status(400).json({ error: 'WhatsApp number is required.' });
    }

    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit WhatsApp phone number.' });
    }

    const validPurpose = ['registration', 'password_reset', 'login', 'withdrawal'].includes(purpose)
      ? (purpose as 'registration' | 'password_reset' | 'login' | 'withdrawal')
      : 'registration';

    // Account existence checks for login & reset vs registration
    const existingUser = db.getUserByWhatsApp(cleanNumber);
    if (validPurpose === 'login' || validPurpose === 'password_reset') {
      if (!existingUser) {
        return res.status(404).json({
          error: `No registered account found with +91 ${cleanNumber}. Please create an account first.`
        });
      }
      if (existingUser.status === 'suspended') {
        return res.status(403).json({
          error: 'Your account has been suspended by administration. Please contact support.'
        });
      }
    } else if (validPurpose === 'registration') {
      if (existingUser) {
        return res.status(400).json({
          error: `An account already exists with WhatsApp number +91 ${cleanNumber}. Please log in.`
        });
      }
    }

    const otpResult = db.generateOtp(cleanNumber, validPurpose);
    const dispatchResult = await dispatchWhatsAppOtp(cleanNumber, otpResult.code, validPurpose);

    return res.json({
      success: true,
      message: `Verification OTP sent to +91 ${cleanNumber}.`,
      cooldownSeconds: otpResult.cooldownSeconds,
      mock_otp: otpResult.code,
      delivery_channel: dispatchResult.channel,
      whatsapp_web_url: dispatchResult.whatsapp_web_url,
      delivery_note: dispatchResult.message
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to send OTP.' });
  }
}

export async function verifyOtpOnly(req: Request, res: Response) {
  try {
    const { whatsapp_number, otp_code, purpose } = req.body;
    if (!whatsapp_number || !otp_code) {
      return res.status(400).json({ error: 'WhatsApp number and OTP code are required.' });
    }

    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    const validPurpose = ['registration', 'password_reset', 'login', 'withdrawal'].includes(purpose)
      ? (purpose as 'registration' | 'password_reset' | 'login' | 'withdrawal')
      : 'registration';

    // keepVerifiedStatus = true so subsequent action (e.g. register) knows it's validated
    db.verifyOtp(cleanNumber, String(otp_code), validPurpose, true);
    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'OTP verification failed.' });
  }
}

export async function loginWithOtp(req: Request, res: Response) {
  try {
    const { whatsapp_number, otp_code } = req.body;
    if (!whatsapp_number || !otp_code) {
      return res.status(400).json({ error: 'WhatsApp number and OTP verification code are required.' });
    }

    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    const user = await db.authenticateUserWithOtp(cleanNumber, String(otp_code));

    const token = signToken({
      userId: user.id,
      role: 'user',
      whatsapp: user.whatsapp_number
    });

    return res.json({
      success: true,
      user,
      token,
      message: 'Logged in successfully via WhatsApp OTP verification.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'OTP Login failed.' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { whatsapp_number, state, city, password, confirm_password } = req.body;

    if (!whatsapp_number || !state || !city || !password || !confirm_password) {
      return res.status(400).json({ error: 'All registration fields (WhatsApp number, state, city, password) are required.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit WhatsApp number.' });
    }

    // Check if user already exists
    const existing = db.getUserByWhatsApp(cleanNumber);
    if (existing) {
      return res.status(400).json({ error: `An account already exists with WhatsApp number +91 ${cleanNumber}. Please log in.` });
    }

    const newUser = await db.createUser({
      whatsapp_number: cleanNumber,
      state: String(state).trim(),
      city: String(city).trim(),
      password: String(password)
    });

    const token = signToken({
      userId: newUser.id,
      role: 'user',
      whatsapp: newUser.whatsapp_number
    });

    return res.status(201).json({
      success: true,
      user: newUser,
      token,
      message: 'Account created successfully! Welcome to Ritam Review Agency.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { whatsapp_number, password } = req.body;

    if (!whatsapp_number || !password) {
      return res.status(400).json({ error: 'WhatsApp number and password are required.' });
    }

    const user = await db.authenticateUser(String(whatsapp_number), String(password));
    const token = signToken({
      userId: user.id,
      role: 'user',
      whatsapp: user.whatsapp_number
    });

    return res.json({
      success: true,
      user,
      token,
      message: 'Logged in successfully.'
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Login failed.' });
  }
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await db.authenticateAdmin(String(username), String(password));
    const token = signToken({
      adminId: admin.id,
      role: admin.role,
      username: admin.username
    });

    return res.json({
      success: true,
      admin,
      token,
      message: 'Admin authenticated successfully.'
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Admin authentication failed.' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { whatsapp_number, new_password, confirm_password } = req.body;

    if (!whatsapp_number || !new_password || !confirm_password) {
      return res.status(400).json({ error: 'WhatsApp number and new passwords are required.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
    await db.resetPassword(cleanNumber, String(new_password));

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Password reset failed.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (req.auth.userId) {
      const user = db.getUserById(req.auth.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json({ role: 'user', user });
    }

    if (req.auth.adminId) {
      return res.json({
        role: 'admin',
        admin: {
          id: req.auth.adminId,
          username: req.auth.username,
          role: req.auth.role
        }
      });
    }

    return res.status(401).json({ error: 'Invalid session.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve profile.' });
  }
}
