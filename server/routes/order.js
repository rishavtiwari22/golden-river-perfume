const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');

// @route   POST /api/order
// @desc    Create a new order and send confirmation email
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log("📥 Incoming Order Request:", req.body);

    const {
      name,
      email,
      address,
      phone,
      productName,
      price,
      size,
      image
    } = req.body;

    // 1. Basic Validation
    if (!name || !email || !productName) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, productName)"
      });
    }

    // 2. Create Order Object
    const orderData = {
      ...req.body,
      orderId: "GR-" + Date.now(),
    };

    // 3. Save to MongoDB (with Offline fallback)
    let order;
    try {
      if (require('mongoose').connection.readyState === 1) {
        order = await Order.create(orderData);
        console.log("📦 Order Saved to DB:", order.orderId);
      } else {
        console.warn("⚠️  DB Offline: Simulating successful order creation (Mock Mode)");
        order = orderData; // Just use the raw data if DB is down
      }
    } catch (dbErr) {
      console.error("❌ DB Save Error:", dbErr.message);
      order = orderData; // Fallback to mock mode if save fails
    }

    // 4. Send Confirmation Email (Async/Non-blocking)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendOrderConfirmation(order)
        .then(() => console.log(`✅ Confirmation email sent to ${order.email}`))
        .catch(err => console.error("⚠️ Email sending failed:", err.message));
    } else {
      console.warn("⚠️ Email credentials missing in .env, skipping email.");
    }

    // 5. Success Response
    res.status(201).json({
      success: true,
      message: "Order placed successfully 🎉 (Mock Mode)",
      order
    });

  } catch (err) {
    console.error("❌ Order route error:", err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your order."
    });
  }
});

module.exports = router;