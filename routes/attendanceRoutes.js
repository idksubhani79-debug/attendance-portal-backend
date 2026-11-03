const express = require('express');
const router = express.Router();
const attCtrl = require('../controllers/attendanceController');
router.post('/checkin', attCtrl.checkIn);
router.post('/checkout', attCtrl.checkOut);
router.get('/history', attCtrl.getHistory);
module.exports = router;
