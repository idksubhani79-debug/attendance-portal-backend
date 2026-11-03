const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const User = require('../models/User');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// Unprotected Password Reset Route with In-line Database update rules
router.put('/reset-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required parameters." });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password.trim(), salt);

    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashPassword, plainPassword: password.trim() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Access Denied ! Email does not Matches" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error during overwrite processing." });
  }
});

module.exports = router;

