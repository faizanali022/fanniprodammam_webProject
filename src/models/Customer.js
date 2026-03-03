const pool = require('../config/db');

class Customer {
    static async findByPhone(phone) {
        const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
        return rows[0];
    }

    static async create(data) {
        const { full_name, phone, email, area, address } = data;
        const [result] = await pool.query(
            'INSERT INTO customers (full_name, phone, email, area, address) VALUES (?, ?, ?, ?, ?)',
            [full_name, phone, email, area, address]
        );
        return result.insertId;
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
        const [result] = await pool.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async incrementBookingStats(phone, cost) {
        const customer = await this.findByPhone(phone);
        if (customer) {
            await pool.query(
                `UPDATE customers 
                SET total_bookings = total_bookings + 1,
                    total_spent = total_spent + ?,
                    last_booking_date = CURDATE()
                WHERE id = ?`,
                [cost || 0, customer.id]
            );
        } else {
            // Optionally create a new customer record if not exists
            // This would require full_name etc., but we can skip for now
        }
    }

    static async getAll(limit = 100) {
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC LIMIT ?', [limit]);
        return rows;
    }
}

module.exports = Customer;