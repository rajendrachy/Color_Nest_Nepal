const express = require('express');
const { getPaints, getPaintById, createPaint, updatePaint, deletePaint } = require('../controllers/paintController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.get('/', getPaints);
router.get('/:id', getPaintById);
router.post('/', protect, admin, createPaint);
router.put('/:id', protect, admin, updatePaint);
router.delete('/:id', protect, admin, deletePaint);

module.exports = router;
