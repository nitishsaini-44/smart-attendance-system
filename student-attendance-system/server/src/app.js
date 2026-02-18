const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); // Import mongoose
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://smart-attendance-system-ten-lilac.vercel.app' // Add your Vercel Client URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Welcome to Smart Attendance API' });
});

// DB Test Route
app.get('/api/test-db', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

        // Force a simple query to verify
        // const collections = await mongoose.connection.db.listCollections().toArray();

        res.json({
            success: true,
            message: 'DB Check',
            connectionState: states[state] || 'unknown',
            hasMongoUri: !!process.env.MONGODB_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            envUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'none'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server
// Start the server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });
}

module.exports = app;
