const crypto = require('crypto');
const axios = require('axios');

/**
 * Generate eSewa signature for payment
 * @param {string} data - String to sign (total_amount,transaction_uuid,product_code)
 * @param {string} secretKey - eSewa secret key
 * @returns {string} - Base64 encoded HMAC-SHA256 signature
 */
exports.generateEsewaSignature = (data, secretKey) => {
  const hash = crypto.createHmac('sha256', secretKey)
    .update(data)
    .digest('base64');
  return hash;
};

/**
 * Initiate Khalti Payment
 * @param {Object} payload - Payment details (amount, orderId, orderName, returnUrl)
 * @param {string} secretKey - Khalti live secret key
 * @returns {Promise<Object>} - Khalti response containing payment_url and pidx
 */
exports.initiateKhaltiPayment = async (payload, secretKey) => {
  try {
    const response = await axios.post(
      process.env.KHALTI_URL || 'https://a.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: payload.returnUrl,
        website_url: process.env.CLIENT_URL,
        amount: Math.round(payload.amount * 100), // convert to paisa
        purchase_order_id: payload.orderId,
        purchase_order_name: payload.orderName || `Order ${payload.orderId}`,
      },
      {
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Khalti Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to initiate Khalti payment');
  }
};

/**
 * Verify Khalti Payment
 * @param {string} pidx - Khalti payment identifier
 * @param {string} secretKey - Khalti live secret key
 * @returns {Promise<Object>} - Verification status
 */
exports.verifyKhaltiPayment = async (pidx, secretKey) => {
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Khalti Verification Error:', error.response?.data || error.message);
    throw new Error('Failed to verify Khalti payment');
  }
};

