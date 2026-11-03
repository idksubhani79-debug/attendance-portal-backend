const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// 🟢 CORS Configuration (Handled directly by Express)
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🟢 Serverless MongoDB Cache (Prevents connection drops on Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendancedb");
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("Database Error:", err.message);
  }
};

// Middleware to ensure DB connection per request on serverless functions
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Bind Live Production Router Paths Mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

const PORT = process.env.PORT || 5000;

// 🟢 Fixed: Only trigger app.listen when running locally or on traditional servers (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Portal backend active locally on port ${PORT}`);
  });
}

// Export Express app instance for Vercel Serverless Function engine
module.exports = app;