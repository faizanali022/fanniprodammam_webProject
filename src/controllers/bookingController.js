const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const BookingService = require('../services/bookingService');

// Public: Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        const bookingId = await Booking.create(bookingData);

        // Optionally create/update customer
        const customer = await Customer.findByPhone(bookingData.phone);
        if (!customer) {
            await Customer.create({
                full_name: bookingData.full_name,
                phone: bookingData.phone,
                email: bookingData.email,
                area: bookingData.area,
                address: bookingData.address
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Booking created successfully',
            bookingId 
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Get all bookings with filters
exports.getAllBookings = async (req, res) => {
    try {
        const { limit, status, service_type, date } = req.query;
        const filters = { status, service_type, date };
        const bookings = await Booking.getAll(filters, parseInt(limit) || 100);
        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Confirm booking (with WhatsApp)
exports.confirmBooking = async (req, res) => {
    try {
        // Get admin's WhatsApp number from admin record (you may need to add column)
        // For now, we'll assume it's stored in admin table as whatsapp_number. If not, you can get from env.
        const admin = await Admin.findById(req.session.adminId);
        const adminWhatsApp = admin.whatsapp_number || process.env.ADMIN_WHATSAPP; // fallback to env

        if (!adminWhatsApp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Admin WhatsApp number not configured' 
            });
        }

        const bookingService = new BookingService(adminWhatsApp);
        const booking = await bookingService.confirmBooking(req.params.id, req.session.adminId);

        res.json({ 
            success: true, 
            message: 'Booking confirmed and WhatsApp notification sent',
            booking 
        });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Update booking status (optionally notify via WhatsApp)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, notify } = req.body; // notify is optional boolean
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await Booking.updateStatus(req.params.id, status);

        if (notify) {
            const admin = await Admin.findById(req.session.adminId);
            const adminWhatsApp = admin.whatsapp_number || process.env.ADMIN_WHATSAPP;
            if (adminWhatsApp) {
                const bookingService = new BookingService(adminWhatsApp);
                await bookingService.whatsapp.sendBookingStatusUpdate(booking.phone, booking, status);
            }
        }

        res.json({ success: true, message: `Booking status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const deleted = await Booking.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Get stats
exports.getStats = async (req, res) => {
    try {
        const stats = await Booking.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Search bookings
exports.searchBookings = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, bookings: [] });
        const bookings = await Booking.search(q);
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};