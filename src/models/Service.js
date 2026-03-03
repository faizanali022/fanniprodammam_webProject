const pool = require('../config/db');

class Service {
    static async getAll(activeOnly = true) {
        let sql = 'SELECT * FROM services';
        if (activeOnly) sql += ' WHERE active = 1';
        sql += ' ORDER BY display_order, service_name';
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { service_name, service_description, category, base_price, min_hours, per_hour_rate, active, display_order } = data;
        const [result] = await pool.query(
            'INSERT INTO services (service_name, service_description, category, base_price, min_hours, per_hour_rate, active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [service_name, service_description, category, base_price, min_hours, per_hour_rate, active !== undefined ? active : 1, display_order || 0]
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
        const [result] = await pool.query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM services WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Service;