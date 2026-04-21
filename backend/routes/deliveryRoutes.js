const express = require('express');
const { calculateDeliveryCharge } = require('../controllers/deliveryController');
const router = express.Router();

router.get('/calculate-charge', calculateDeliveryCharge);

module.exports = router;
