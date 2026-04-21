const express = require('express');
const { 
  getDashboardStats, 
  getAllOrders, 
  updateOrderStatus, 
  assignDeliveryPartner, 
  getAllUsers, 
  updateUserRole,
  deleteUser,
  getWarehouses, 
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  deleteOrder,
  getSettings,
  updateSettings,
  logReportDownload,
  getReportLogs
} = require('../controllers/adminController');
const { createPaint, updatePaint, deletePaint } = require('../controllers/paintController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);
router.put('/orders/:id/assign-delivery', assignDeliveryPartner);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.put('/warehouses/:id', updateWarehouse);
router.delete('/warehouses/:id', deleteWarehouse);

// Admin Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Paint Management
router.post('/paints', createPaint);
router.put('/paints/:id', updatePaint);
router.delete('/paints/:id', deletePaint);

// Report Logging
router.post('/report-logs', logReportDownload);
router.get('/report-logs', getReportLogs);

module.exports = router;
