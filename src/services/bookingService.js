const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const WhatsAppService = require('./whatsappService');

class BookingService {
    constructor(adminWhatsAppNumber) {
        this.whatsapp = new WhatsAppService(adminWhatsAppNumber);
    }

    async confirmBooking(bookingId, adminId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');
        if (booking.status !== 'pending') throw new Error('Booking is not pending');

        // Update status to confirmed
        await Booking.updateStatus(bookingId, 'confirmed');

        // Update customer stats
        await Customer.incrementBookingStats(booking.phone, booking.estimated_cost);

        // Send WhatsApp confirmation
        try {
            await this.whatsapp.sendBookingConfirmation(booking.phone, booking);
        } catch (error) {
            console.error('WhatsApp send failed:', error);
            // Log but don't fail the confirmation
        }

        return booking;
    }

    async updateStatusAndNotify(bookingId, newStatus, adminId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');

        await Booking.updateStatus(bookingId, newStatus);

        // Send WhatsApp update
        try {
            await this.whatsapp.sendBookingStatusUpdate(booking.phone, booking, newStatus);
        } catch (error) {
            console.error('WhatsApp send failed:', error);
        }

        return booking;
    }

    // Add other business logic as needed
}

module.exports = BookingService;