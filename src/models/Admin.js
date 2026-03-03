const pool = require('../config/db');
const bcrypt = require('bcrypt');

class Admin {
    static async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
        return rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static async create(data) {
        const { username, password, full_name, email, role, status } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO admins (username, password, full_name, email, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, email, role || 'admin', status || 'active']
        );
        return result.insertId;
    }

    static async updateLastLogin(id) {
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [id]);
    }

    static async updateWhatsAppNumber(id, whatsappNumber) {
        // Note: admins table doesn't have whatsapp_number column by default; add if needed
        await pool.query('UPDATE admins SET whatsapp_number = ? WHERE id = ?', [whatsappNumber, id]);
    }
}

module.exports = Admin;