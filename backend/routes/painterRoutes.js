const express = require('express');
const router = express.Router();
const Painter = require('../models/Painter');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/painters
// @desc    Register a new painter
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, experience, location, specialties, bio, image } = req.body;

    const painterExists = await Painter.findOne({ email });

    if (painterExists) {
      return res.status(400).json({ message: 'Painter already registered with this email' });
    }

    const painter = await Painter.create({
      name,
      email,
      phone,
      experience,
      location,
      specialties: specialties || [],
      bio,
      image: image || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop'
    });

    res.status(201).json(painter);
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
