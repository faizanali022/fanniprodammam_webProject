const express = require('express');
const router = express.Router();
const path = require('path');
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/admin', adminRoutes);

// Serve HTML pages
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../../views/index.html')));
router.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../../views/about.html')));
router.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../../views/contact.html')));
router.get('/services', (req, res) => res.sendFile(path.join(__dirname, '../../views/services.html')));
router.get('/booking', (req, res) => res.sendFile(path.join(__dirname, '../../views/booking.html')));
router.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, '../../views/admin-login.html')));
router.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../../views/admin-panel.html')));

module.exports = router;