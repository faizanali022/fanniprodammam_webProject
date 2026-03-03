const twilio = require('twilio');

class WhatsAppService {
    constructor(adminNumber) {
        this.adminNumber = adminNumber; // The admin's WhatsApp number (e.g., '966581524732')
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    /**
     * Send a WhatsApp message
     * @param {string} to - recipient phone number (international format, e.g., '966xxxxxxxxx')
     * @param {string} message - message content
     * @returns {Promise<object>} Twilio message object
     */
    async sendMessage(to, message) {
        try {
            // Ensure numbers are in the format required by Twilio (whatsapp:+1234567890)
            const fromNumber = `whatsapp:${this.adminNumber}`;
            const toNumber = `whatsapp:${to}`;

            const twilioMessage = await this.twilioClient.messages.create({
                body: message,
                from: fromNumber,
                to: toNumber
            });

            console.log(`✅ WhatsApp message sent to ${to} (SID: ${twilioMessage.sid})`);
            return { success: true, sid: twilioMessage.sid };
        } catch (error) {
            console.error('❌ Twilio error:', error);
            // Rethrow or handle gracefully
            throw new Error(`Failed to send WhatsApp message: ${error.message}`);
        }
    }

    /**
     * Send booking confirmation to customer
     * @param {string} customerPhone - customer's phone number
     * @param {object} bookingDetails - booking object from database
     * @returns {Promise<object>}
     */
    async sendBookingConfirmation(customerPhone, bookingDetails) {
        const message = `*Booking Confirmed!* ✅\n\n` +
            `Dear ${bookingDetails.full_name},\n\n` +
            `Your booking has been confirmed:\n` +
            `📅 *Date:* ${bookingDetails.service_date}\n` +
            `⏰ *Time:* ${bookingDetails.time_slot}\n` +
            `🔧 *Service:* ${bookingDetails.service_type || bookingDetails.service}\n` +
            `📍 *Area:* ${bookingDetails.area}\n\n` +
            `Thank you for choosing us! If you have any questions, reply to this message.`;

        return this.sendMessage(customerPhone, message);
    }

    /**
     * Send booking status update
     * @param {string} customerPhone
     * @param {object} bookingDetails
     * @param {string} newStatus - new status (e.g., 'confirmed', 'in_progress', 'completed')
     * @returns {Promise<object>}
     */
    async sendBookingStatusUpdate(customerPhone, bookingDetails, newStatus) {
        const statusEmoji = {
            'confirmed': '✅',
            'assigned': '👨‍🔧',
            'in_progress': '🛠️',
            'completed': '🎉',
            'cancelled': '❌'
        };
        const emoji = statusEmoji[newStatus] || 'ℹ️';
        const message = `${emoji} *Booking Status Update*\n\n` +
            `Your booking (Ref: ${bookingDetails.booking_reference || bookingDetails.id}) is now *${newStatus}*.\n\n` +
            `Thank you for your patience.`;

        return this.sendMessage(customerPhone, message);
    }
}

module.exports = WhatsAppService;