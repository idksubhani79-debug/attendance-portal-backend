const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.checkIn = async (req, res) => {
  try {
    const { userId, username, date, time, allowedCheckInTime } = req.body;
    let record = await Attendance.findOne({ userId, date });
    if (record && record.checkIn) return res.status(400).json({ message: "Already checked in today." });

    const cutoffTime = allowedCheckInTime || "09:00";
    const [cutoffHours, cutoffMinutes] = cutoffTime.split(':').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    let status = "On Time";
    if (hours > cutoffHours || (hours === cutoffHours && minutes > cutoffMinutes)) {
      status = "Late Arrival";
    }

    if (!record) {
      record = new Attendance({ userId, username, date, checkIn: time, status, allowedCheckInTime: cutoffTime });
    } else {
      record.checkIn = time;
      record.status = status;
    }
    await record.save();
    res.json({ message: "Checked in successfully", record });
  } catch (err) {
    res.status(500).json({ message: "Check-in pipeline failed" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { userId, date, time, allowedCheckOutTime } = req.body;
    let record = await Attendance.findOne({ userId, date });
    if (!record) return res.status(400).json({ message: "No active check-in record found for today." });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out today." });

    record.checkOut = time;
    await record.save();
    res.json({ message: "Checked out successfully", record });
  } catch (err) {
    res.status(500).json({ message: "Check-out pipeline failed" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Attendance.find().sort({ _id: -1 });
    const users = await User.find();

    // Perform a clean lookup to append emails and clear-text passwords to matching admin rows [INDEX]
    const combinedData = history.map(record => {
      const recordName = (record.username || "").toLowerCase().trim();
      const matchedProfile = users.find(u => (u.username || "").toLowerCase().trim() === recordName);
      return {
        ...record._doc,
        employeeEmail: matchedProfile ? matchedProfile.email : "Not Linked",
        employeeCredentials: matchedProfile ? matchedProfile.plainPassword : "••••••••"
      };
    });
    res.json(combinedData);
  } catch (err) {
    res.status(500).json({ message: "Failed to compile database profiles." });
  }
};