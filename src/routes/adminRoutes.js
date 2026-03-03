const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const { isAuthenticated, isSuperAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', isAuthenticated, adminController.getDashboard);

// Booking management
router.get('/bookings', isAuthenticated, bookingController.getAllBookings);
router.get('/bookings/:id', isAuthenticated, bookingController.getBookingById);
router.put('/bookings/:id/status', isAuthenticated, bookingController.updateBookingStatus);
router.post('/bookings/:id/confirm', isAuthenticated, bookingController.confirmBooking);
router.delete('/bookings/:id', isAuthenticated, bookingController.deleteBooking);

// Contact messages
router.get('/messages', isAuthenticated, adminController.getMessages);
router.get('/messages/:id', isAuthenticated, adminController.getMessageById);
router.put('/messages/:id/status', isAuthenticated, adminController.updateMessageStatus);
router.delete('/messages/:id', isAuthenticated, adminController.deleteMessage);

// Customers
router.get('/customers', isAuthenticated, adminController.getCustomers);

// Services
router.get('/services', isAuthenticated, adminController.getServices);

// Profile
router.put('/whatsapp-number', isAuthenticated, adminController.updateWhatsAppNumber);

// Super admin only routes (example)
// router.get('/admins', isSuperAdmin, adminController.getAdmins);

module.exports = router;