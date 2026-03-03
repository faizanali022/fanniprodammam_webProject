const pool = require('../config/db');

class Booking {
    static async create(data) {
        const {
            service, service_type, service_date, time_slot, description,
            full_name, phone, email, area, address, notes,
            status = 'pending', estimated_hours, estimated_cost
        } = data;

        // Generate booking reference (optional)
        const booking_reference = 'BK' + Date.now().toString(36).toUpperCase();

        const [result] = await pool.query(
            `INSERT INTO bookings 
            (booking_reference, service, service_type, service_date, time_slot, description,
             full_name, phone, email, area, address, notes, status, estimated_hours, estimated_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [booking_reference, service, service_type, service_date, time_slot, description,
             full_name, phone, email, area, address, notes, status, estimated_hours, estimated_cost]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        return rows[0];
    }

    static async getAll(filters = {}, limit = 100) {
        let sql = 'SELECT * FROM bookings WHERE 1=1';
        const values = [];
        if (filters.status) {
            sql += ' AND status = ?';
            values.push(filters.status);
        }
        if (filters.service_type) {
            sql += ' AND service_type = ?';
            values.push(filters.service_type);
        }
        if (filters.date) {
            sql += ' AND DATE(service_date) = ?';
            values.push(filters.date);
        }
        sql += ' ORDER BY created_at DESC LIMIT ?';
        values.push(limit);
        const [rows] = await pool.query(sql, values);
        return rows;
    }

    static async updateStatus(id, status) {
        const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (fields.length === 0) return false;
        values.push(id);
        const [result] = await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getStats() {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM bookings
        `);
        return rows[0];
    }

    static async search(term) {
        const [rows] = await pool.query(
            `SELECT * FROM bookings 
            WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR booking_reference LIKE ?
            ORDER BY created_at DESC`,
            [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
        );
        return rows;
    }

    // Get bookings for a specific customer
    static async getByCustomerPhone(phone) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE phone = ? ORDER BY created_at DESC', [phone]);
        return rows;
    }
}

module.exports = Booking;