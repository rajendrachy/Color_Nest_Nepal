const express = require('express');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  trackOrder, 
  initiateEsewaPayment,
  verifyEsewaPayment,
  initiateKhalti,
  verifyKhalti,
  verifyTestPayment
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/create').post(protect, createOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/verify-esewa').get(verifyEsewaPayment);
router.route('/verify-khalti').get(verifyKhalti);
router.route('/verify-test').post(protect, verifyTestPayment);
router.route('/:id').get(getOrderById);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/track').get(trackOrder);
router.route('/:id/initiate-esewa').get(protect, initiateEsewaPayment);
router.route('/:id/initiate-khalti').get(protect, initiateKhalti);

module.exports = router;

