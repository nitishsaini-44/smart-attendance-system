// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const teacherRoutes = require('./routes/teacherRoutes');
// const errorHandler = require('./middleware/errorHandler');

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
//     credentials: true
// }));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Static files for uploads
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/teacher', teacherRoutes);

// // Health check route
// app.get('/api/health', (req, res) => {
//     res.json({ success: true, message: 'Server is running' });
// });

// // Error handling middleware
// app.use(errorHandler);

// // Handle 404
// app.use((req, res) => {
//     res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`API available at http://localhost:${PORT}/api`);
// });

const express = require('express');
const cors = require('cors');
const path = require('path');
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
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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