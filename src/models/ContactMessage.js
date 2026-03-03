const pool = require('../config/db');

class ContactMessage {
    static async create(data) {
        const { name, email, phone, service, message, status = 'unread' } = data;
        const [result] = await pool.query(
            'INSERT INTO contact_messages (name, email, phone, service, message, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, service, message, status]
        );
        return result.insertId;
    }

    static async getAll(filters = {}, limit = 50) {
        let sql = 'SELECT * FROM contact_messages WHERE 1=1';
        const values = [];
        if (filters.status) {
            sql += ' AND status = ?';
            values.push(filters.status);
        }
        sql += ' ORDER BY created_at DESC LIMIT ?';
        values.push(limit);
        const [rows] = await pool.query(sql, values);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM contact_messages WHERE id = ?', [id]);
        return rows[0];
    }

    static async updateStatus(id, status, admin_notes = null) {
        let sql = 'UPDATE contact_messages SET status = ?';
        const values = [status];
        if (admin_notes !== undefined) {
            sql += ', admin_notes = ?';
            values.push(admin_notes);
        }
        sql += ' WHERE id = ?';
        values.push(id);
        const [result] = await pool.query(sql, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ContactMessage;