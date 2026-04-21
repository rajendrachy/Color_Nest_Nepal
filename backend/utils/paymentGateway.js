const axios = require('axios');
const crypto = require('crypto');

// eSewa payment verification
exports.verifyEsewa = async (amt, rid, pid) => {
  try {
    const response = await axios.get(`https://esewa.com.np/epay/transrec?amt=${amt}&rid=${rid}&pid=${pid}&scd=${process.env.ESEWA_MERCHANT_ID}`);
    return response.data.includes("Success");
  } catch (error) {
    console.error('eSewa verification failed:', error);
    return false;
  }
};

// Khalti payment verification
exports.verifyKhalti = async (token, amount) => {
  try {
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token, amount },
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Khalti verification failed:', error);
    return false;
  }
};

// HMAC generation for eSewa v2 (if needed)
exports.generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
  const secretKey = process.env.ESEWA_SECRET_KEY;
  const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const hash = crypto.createHmac('sha256', secretKey).update(data).digest('base64');
  return hash;
};
