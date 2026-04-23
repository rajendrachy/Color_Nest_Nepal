const express = require('express');
const router = express.Router();
const Painter = require('../models/Painter');
const PainterRequest = require('../models/PainterRequest');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

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
