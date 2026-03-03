const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public: Create booking
router.post('/', bookingController.createBooking);

// Admin: Get all bookings (with optional admin route)
router.get('/', isAuthenticated, bookingController.getAllBookings);

// Admin: Get booking by ID
router.get('/:id', isAuthenticated, bookingController.getBookingById);

// Admin: Update booking status
router.put('/:id/status', isAuthenticated, bookingController.updateBookingStatus);

// Admin: Confirm booking
router.post('/:id/confirm', isAuthenticated, bookingController.confirmBooking);

// Admin: Delete booking
router.delete('/:id', isAuthenticated, bookingController.deleteBooking);

module.exports = router;
