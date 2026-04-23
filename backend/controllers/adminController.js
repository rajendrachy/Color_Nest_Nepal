const Order = require('../models/Order');
const User = require('../models/User');
const Paint = require('../models/Paint');
const Warehouse = require('../models/Warehouse');
const Setting = require('../models/Setting');
const ReportLog = require('../models/ReportLog');
const Notification = require('../models/Notification');


exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (settings) {
      console.log('UPDATING SYSTEM CONFIG:', req.body);
      settings = await Setting.findOneAndUpdate({}, req.body, { new: true });
    } else {
      settings = await Setting.create(req.body);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const lowStockPaints = await Paint.countDocuments({ availableQuantity: { $lt: 10 } });

    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user', 'name');

    const salesByRegion = await Order.aggregate([
      { $group: { _id: '$deliveryAddress.province', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats: {
        revenue: totalSales[0]?.total || 0,
        orders: totalOrders,
        users: totalUsers,
        lowStock: lowStockPaints
      },
      recentOrders,
      salesByRegion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.paint', 'name colorCode category')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note, timestamp: new Date() });
    
    if (status === 'delivered') {
      order.paymentStatus = 'completed';
      order.actualDelivery = new Date();
    }

    await order.save();

    // Create Notification for User
    try {
      await Notification.create({
        user: order.user,
        title: 'Order Status Updated',
        message: `Your order ${order.orderId} is now ${status.replace(/_/g, ' ')}.`,
        type: 'order',
        link: '/dashboard'
      });
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr.message);
    }

    // Emit socket event for real-time tracking
    const io = req.app.get('socketio');
    io.to(order._id.toString()).emit('order_status_updated', { status, note });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        deliveryPartner: { name, phone, trackingNumber },
        orderStatus: 'dispatched'
      },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Security Breach: System prevents self-revocation of administrative access.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User account revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logReportDownload = async (req, res) => {
  try {
    const { reportType, reportName } = req.body;
    const log = await ReportLog.create({
      user: req.user._id,
      reportType,
      reportName,
      downloadTimestamp: new Date()
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportLogs = async (req, res) => {
  try {
    const logs = await ReportLog.find().populate('user', 'name email').sort('-downloadTimestamp');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
