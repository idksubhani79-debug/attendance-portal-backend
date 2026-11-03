const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  status: { type: String, default: 'On Time' }, 
  allowedCheckInTime: { type: String, default: "09:00" },
  allowedCheckOutTime: { type: String, default: "17:00" }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
