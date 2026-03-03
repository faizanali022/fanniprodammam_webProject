const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const Customer = require('../models/Customer');
const Service = require('../models/Service');

// Dashboard summary
exports.getDashboard = async (req, res) => {
    try {
        const stats = await Booking.getStats();
        const recentBookings = await Booking.getAll({}, 5);
        const messages = await ContactMessage.getAll({ status: 'unread' }, 5);
        const customers = await Customer.getAll(5);
        const services = await Service.getAll(true);

        res.json({ 
            success: true, 
            stats,
            recentBookings,
            unreadMessages: messages.length,
            recentMessages: messages,
            recentCustomers: customers,
            services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Contact messages
exports.getMessages = async (req, res) => {
    try {
        const filters = req.query;
        const messages = await ContactMessage.getAll(filters);
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const updated = await ContactMessage.updateStatus(req.params.id, status, admin_notes);
        if (!updated) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, message: 'Message updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const deleted = await ContactMessage.delete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.getAll();
        res.json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Services
exports.getServices = async (req, res) => {
    try {
        const services = await Service.getAll();
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin profile
exports.updateWhatsAppNumber = async (req, res) => {
    try {
        const { whatsapp_number } = req.body;
        await Admin.updateWhatsAppNumber(req.session.adminId, whatsapp_number);
        res.json({ success: true, message: 'WhatsApp number updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};