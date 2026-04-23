const express = require('express');
const router = express.Router();
const Painter = require('../models/Painter');
const PainterRequest = require('../models/PainterRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

// @route   POST /api/painters
// @desc    Register a new painter (User must be logged in)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, phone, experience, location, specialties, bio, image, certificate } = req.body;

    const painterExists = await Painter.findOne({ user: req.user._id });

    if (painterExists) {
      return res.status(400).json({ message: 'You are already registered as a painter' });
    }

    const emailExists = await Painter.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Painter already registered with this email' });
    }

    const painter = await Painter.create({
      user: req.user._id,
      name,
      email,
      phone,
      experience,
      location,
      specialties: specialties || [],
      bio,
      image: image || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop',
      certificate
    });

    // Update user role to painter
    const user = await User.findById(req.user._id);
    if(user.role !== 'admin') {
      user.role = 'painter';
      await user.save();
    }

    res.status(201).json({
      painter,
      updatedUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/painters
// @desc    Get all painters (Public sees only verified, Admin sees all)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isAdmin } = req.query; // Send isAdmin=true from frontend if admin
    let query = {};
    
    // If not requested explicitly as admin, only show verified
    if (isAdmin !== 'true') {
      query.verified = true;
    }
    
    const painters = await Painter.find(query).sort({ createdAt: -1 });
    res.json(painters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/painters/requests
// @desc    Get painter requests (For the logged-in painter)
// @access  Private (Painter only)
router.get('/requests', protect, async (req, res) => {
  try {
    const painter = await Painter.findOne({ user: req.user._id });
    if (!painter) {
      return res.status(404).json({ message: 'Painter profile not found' });
    }

    const requests = await PainterRequest.find({ painter: painter._id })
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/painters/requests/:reqId
// @desc    Update request status
// @access  Private (Painter only)
router.put('/requests/:reqId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PainterRequest.findById(req.params.reqId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const painter = await Painter.findOne({ user: req.user._id });
    if (!painter || request.painter.toString() !== painter._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    const updatedRequest = await request.save();

    // Create In-App Notification
    try {
      const fullRequest = await PainterRequest.findById(req.params.reqId)
        .populate('user', 'name email')
        .populate('painter', 'name');

      if (fullRequest && fullRequest.user) {
        const statusText = status === 'accepted' ? 'Accepted' : (status === 'rejected' ? 'Declined' : status);
        
        await Notification.create({
          user: fullRequest.user._id,
          title: `Booking ${statusText}`,
          message: `Your painting request with ${fullRequest.painter.name} has been ${statusText.toLowerCase()}.`,
          type: 'painter_request',
          link: '/dashboard'
        });
      }
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr.message);
    }

    // Notify user via email
    try {
      const fullRequest = await PainterRequest.findById(req.params.reqId)
        .populate('user', 'name email')
        .populate('painter', 'name');

      if (fullRequest && fullRequest.user && fullRequest.user.email) {
        const statusText = status === 'accepted' ? 'Accepted' : (status === 'rejected' ? 'Declined' : status);
        const subject = `Your Painting Appointment has been ${statusText}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #c41e3a; text-align: center;">ColorNest Nepal</h2>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p>Dear <strong>${fullRequest.user.name}</strong>,</p>
            <p>We wanted to inform you that your booking request with <strong>${fullRequest.painter.name}</strong> has been <strong>${statusText.toLowerCase()}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Status:</strong> ${statusText}</p>
              <p style="margin: 10px 0 0 0;"><strong>Professional:</strong> ${fullRequest.painter.name}</p>
            </div>

            <p>You can track your appointments and view more details by logging into your dashboard on the ColorNest website.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #c41e3a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 0.8rem; color: #64748b; text-align: center;">
              This is an automated email from ColorNest Nepal. Please do not reply to this email.
            </p>
          </div>
        `;

        await sendEmail({
          to: fullRequest.user.email,
          subject,
          html
        });
      }
    } catch (emailErr) {
      console.error('Error sending notification email:', emailErr.message);
      // Don't fail the request if email fails
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/painters/:id/request
// @desc    User requests a painter
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
  try {
    const { address, details } = req.body;
    
    const painter = await Painter.findById(req.params.id);
    if (!painter) {
      return res.status(404).json({ message: 'Painter not found' });
    }

    const newRequest = await PainterRequest.create({
      painter: painter._id,
      user: req.user._id,
      address,
      details
    });

    // Notify painter
    await Notification.create({
      user: painter.user,
      title: 'New Booking Request',
      message: `You have received a new painting request from ${req.user.name}.`,
      type: 'painter_request',
      link: '/painter-dashboard'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/painters/:id/verify
// @desc    Verify/unverify a painter
// @access  Private/Admin
router.put('/:id/verify', protect, admin, async (req, res) => {
  try {
    const painter = await Painter.findById(req.params.id);
    
    if (painter) {
      painter.verified = !painter.verified; // Toggle
      const updatedPainter = await painter.save();
      res.json(updatedPainter);
    } else {
      res.status(404).json({ message: 'Painter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/painters/:id
// @desc    Delete a painter
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const painter = await Painter.findByIdAndDelete(req.params.id);
    if (painter) {
      res.json({ message: 'Painter removed' });
    } else {
      res.status(404).json({ message: 'Painter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
