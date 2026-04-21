const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const Setting = require('../models/Setting');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Sanitize address to avoid Mongoose cast errors on coordinates
    const safeAddress = address ? {
      province: address.province || '',
      district: address.district || '',
      municipality: address.municipality || '',
      ward: address.ward || null,
      street: address.street || '',
      landmark: address.landmark || '',
      coordinates: (address.coordinates && address.coordinates.lat != null)
        ? { lat: address.coordinates.lat, lng: address.coordinates.lng }
        : {}
    } : {};

    const user = await User.create({ name, email, phone, password, address: safeAddress });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      // Check global 2FA setting - Only enforced for Admins
      const settings = await Setting.findOne();
      if (settings?.twoFactorAuth && user.role === 'admin') {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = code;
        user.twoFactorExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        await emailService.sendEmail({
          to: user.email,
          subject: 'Your 2FA Verification Code',
          text: `Your verification code is ${code}. It expires in 10 minutes.`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c41e3a;">Security Verification</h2>
            <p>Your verification code for ColorNest Nepal is:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${code}</div>
            <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
          </div>`
        });

        return res.json({ twoFactorRequired: true, email: user.email });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        cart: user.cart,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ 
      email, 
      twoFactorCode: code,
      twoFactorExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }

    // Clear code
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      cart: user.cart,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    });

    res.json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;
    if (req.body.address) {
      // Sanitize: strip undefined values to prevent Mongoose cast errors
      const incoming = req.body.address;
      user.address = {
        province: incoming.province || user.address?.province || '',
        district: incoming.district || user.address?.district || '',
        municipality: incoming.municipality || user.address?.municipality || '',
        ward: incoming.ward != null ? incoming.ward : (user.address?.ward || null),
        street: incoming.street || user.address?.street || '',
        landmark: incoming.landmark || user.address?.landmark || '',
        coordinates: (incoming.coordinates && incoming.coordinates.lat != null)
          ? { lat: incoming.coordinates.lat, lng: incoming.coordinates.lng }
          : (user.address?.coordinates || {})
      };
    }
    if (req.body.cart !== undefined) {
      user.cart = req.body.cart;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      address: updatedUser.address,
      role: updatedUser.role,
      cart: updatedUser.cart,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
