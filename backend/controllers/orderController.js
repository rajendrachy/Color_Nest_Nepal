const Order = require('../models/Order');
const Paint = require('../models/Paint');
const { VAT_RATE } = require('../config/constants');
const { generateEsewaSignature } = require('../utils/paymentUtils');

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, deliveryCharge } = req.body;
    
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators are not permitted to place orders. Please use a customer account.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Process each item and deduct stock
    for (const item of items) {
      const paint = await Paint.findById(item.paint);
      if (!paint) return res.status(404).json({ message: `Paint ${item.paint} not found` });
      
      if (paint.availableQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${paint.name}. Available: ${paint.availableQuantity}` });
      }

      const itemTotal = paint.pricePerLiter * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        paint: paint._id,
        quantity: item.quantity,
        price: paint.pricePerLiter,
        total: itemTotal
      });

      // Deduct stock
      paint.availableQuantity -= item.quantity;
      await paint.save();
    }

    let rawVat = subtotal * VAT_RATE;
    const vat = Math.round(rawVat * 100) / 100;
    subtotal = Math.round(subtotal * 100) / 100;
    const totalAmount = Math.round((subtotal + vat + (deliveryCharge || 0)) * 100) / 100;

    const isOnlinePayment = ['eSewa', 'Khalti', 'ConnectIPS'].includes(paymentMethod);

    const order = new Order({
      orderId: `NP-${Date.now()}`,
      user: req.user._id,
      items: orderItems,
      subtotal,
      vat,
      deliveryCharge: deliveryCharge || 0,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      orderStatus: isOnlinePayment ? 'payment_pending' : 'pending',
      statusHistory: [{ 
        status: isOnlinePayment ? 'payment_pending' : 'pending', 
        note: isOnlinePayment ? 'Order initiated, awaiting online payment' : 'Order placed by user (COD)' 
      }]
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.paint', 'name images pricePerLiter')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      query = { orderId: id };
    }

    const order = await Order.findOne(query).populate('items.paint').populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Authorization check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel this order' });
    }

    // Can only cancel if status is pending or payment_pending
    const cancellableStatuses = ['pending', 'payment_pending'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ message: `Cannot cancel order in ${order.orderStatus} status` });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'No reason provided';
    order.statusHistory.push({ 
      status: 'cancelled', 
      note: `Cancelled by user. Reason: ${reason || 'N/A'}` 
    });
    
    // Restore stock
    const Paint = require('../models/Paint');
    for (const item of order.items) {
      await Paint.findByIdAndUpdate(item.paint, { $inc: { availableQuantity: item.quantity } });
    }

    await order.save();

    // Send email notification
    const user = await require('../models/User').findById(order.user);
    if (user) {
      const emailService = require('../utils/emailService');
      await emailService.sendEmail({
        to: user.email,
        subject: `Order Cancelled: ${order.orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h2 style="color: #c41e3a;">Order Cancelled</h2>
            <p>Namaste ${user.name},</p>
            <p>Your order <strong>${order.orderId}</strong> has been successfully cancelled as per your request.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 0.9rem; color: #64748b;">Reason for cancellation:</p>
              <p style="margin: 5px 0 0 0; font-weight: 600;">${order.cancellationReason}</p>
            </div>
            <p>If this was a mistake, or if you have any questions, please contact our support team at support@colornest.com.np.</p>
            <p>Any payments made via eSewa/Khalti will be reviewed for refund within 3-5 business days.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">ColorNest Nepal - Premium Paints & Solutions</p>
          </div>
        `
      });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('orderStatus statusHistory deliveryPartner estimatedDelivery');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const amount = Number(order.totalAmount).toString();
    const transaction_uuid = order.orderId;
    const product_code = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
    const secret = process.env.ESEWA_SECRET_KEY || '8g8M8dg76h8dgYS5D8back8n76';

    // eSewa v2 signature string: total_amount=100,transaction_uuid=123,product_code=EPAYTEST
    const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = generateEsewaSignature(signatureString, secret);

    res.json({
      amount: amount,
      tax_amount: '0',
      total_amount: amount,
      transaction_uuid: transaction_uuid,
      product_code: product_code,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.CLIENT_URL}/payment-success/esewa`,
      failure_url: `${process.env.CLIENT_URL}/payment-failure/esewa`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
      esewa_url: process.env.ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query; // eSewa sends back encoded data
    if (!data) return res.status(400).json({ message: 'Missing payment data' });

    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const { transaction_uuid, total_amount, status } = decodedData;

    if (status === 'COMPLETE') {
      // Find order by orderId since we changed transaction_uuid
      const order = await Order.findOne({ orderId: transaction_uuid });
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Optional: Verify amount (remove commas if any)
      const receivedAmount = parseFloat(total_amount.replace(/,/g, ''));
      if (Math.abs(receivedAmount - order.totalAmount) > 0.01) {
        return res.status(400).json({ message: 'Amount mismatch' });
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'pending'; // Change from payment_pending to pending (official)
      order.statusHistory.push({ status: 'pending', note: 'Payment verified via eSewa' });
      await order.save();

      return res.json({ success: true, orderId: order._id });
    }

    res.status(400).json({ message: 'Payment not completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { initiateKhaltiPayment, verifyKhaltiPayment } = require('../utils/paymentUtils');

exports.initiateKhalti = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const khaltiResponse = await initiateKhaltiPayment({
      amount: order.totalAmount,
      orderId: order._id.toString(),
      orderName: `Order ${order.orderId}`,
      returnUrl: `${process.env.CLIENT_URL}/payment-success/khalti`
    }, process.env.KHALTI_SECRET_KEY || 'test_secret_key_6789012345678901234567890');

    res.json(khaltiResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyKhalti = async (req, res) => {
  try {
    const { pidx } = req.query;
    if (!pidx) return res.status(400).json({ message: 'Missing pidx' });

    const verification = await verifyKhaltiPayment(
      pidx, 
      process.env.KHALTI_SECRET_KEY || 'test_secret_key_6789012345678901234567890'
    );

    if (verification.status === 'Completed') {
      const order = await Order.findById(verification.purchase_order_id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      // Verify amount (Khalti sends amount in paisa)
      const receivedAmount = verification.total_amount / 100;
      if (Math.abs(receivedAmount - order.totalAmount) > 0.01) {
        return res.status(400).json({ message: 'Amount mismatch' });
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'pending';
      order.statusHistory.push({ status: 'pending', note: 'Payment verified via Khalti' });
      await order.save();

      return res.json({ success: true, orderId: order._id });
    }

    res.status(400).json({ message: verification.status || 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyTestPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'completed';
    order.orderStatus = 'pending';
    order.statusHistory.push({ status: 'pending', note: 'Payment verified via Test Gateway (Simulated)' });
    await order.save();

    res.json({ success: true, orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
