// scripts/booking.js - Server-side booking module
const pool = require('../config/db');

const bookingModule = {
    
    // Create a new booking
    createBooking: async function(bookingData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO bookings 
                (service, service_date, time_slot, full_name, phone, email, area, address, description, notes, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `;
            
            const values = [
                bookingData.service,
                bookingData.serviceDate,
                bookingData.timeSlot,
                bookingData.fullName,
                bookingData.phone,
                bookingData.email || null,
                bookingData.area,
                bookingData.address,
                bookingData.description || '',
                bookingData.notes || ''
            ];
            
            pool.query(sql, values, (err, result) => {
                if (err) {
                    console.error('❌ Database error in createBooking:', err);
                    reject(err);
                } else {
                    console.log(`✅ Booking created successfully - ID: ${result.insertId}, Customer: ${bookingData.fullName}`);
                    resolve({ 
                        success: true, 
                        bookingId: result.insertId 
                    });
                }
            });
        });
    },

    // Get all bookings with optional limit
    getAllBookings: async function(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings ORDER BY created_at DESC LIMIT ?`;
            
            pool.query(sql, [limit], (err, results) => {
                if (err) {
                    console.error('❌ Database error in getAllBookings:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} bookings`);
                    resolve(results);
                }
            });
        });
    },

    // Get bookings with filters
    getBookingsWithFilters: async function(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM bookings WHERE 1=1`;
            const values = [];
            
            if (filters.status) {
                sql += ` AND status = ?`;
                values.push(filters.status);
            }
            
            if (filters.date) {
                sql += ` AND DATE(service_date) = ?`;
                values.push(filters.date);
            }
            
            if (filters.service) {
                sql += ` AND service = ?`;
                values.push(filters.service);
            }
            
            sql += ` ORDER BY created_at DESC`;
            
            pool.query(sql, values, (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingsWithFilters:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} filtered bookings`);
                    resolve(results);
                }
            });
        });
    },

    // Get booking by ID
    getBookingById: async function(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE id = ?`;
            
            pool.query(sql, [id], (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingById:', err);
                    reject(err);
                } else {
                    if (results[0]) {
                        console.log(`✅ Found booking ID: ${id}`);
                        resolve(results[0]);
                    } else {
                        console.log(`⚠️ Booking ID ${id} not found`);
                        resolve(null);
                    }
                }
            });
        });
    },

    // Update booking status
    updateBookingStatus: async function(id, status) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?`;
            
            pool.query(sql, [status, id], (err, result) => {
                if (err) {
                    console.error('❌ Database error in updateBookingStatus:', err);
                    reject(err);
                } else {
                    console.log(`✅ Updated booking ${id} status to ${status}`);
                    resolve({ 
                        success: true, 
                        affectedRows: result.affectedRows 
                    });
                }
            });
        });
    },

    // Delete booking
    deleteBooking: async function(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM bookings WHERE id = ?`;
            
            pool.query(sql, [id], (err, result) => {
                if (err) {
                    console.error('❌ Database error in deleteBooking:', err);
                    reject(err);
                } else {
                    console.log(`✅ Deleted booking ID: ${id}`);
                    resolve({ 
                        success: true, 
                        affectedRows: result.affectedRows 
                    });
                }
            });
        });
    },

    // Get booking statistics
    getBookingStats: async function() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
                FROM bookings
            `;
            
            pool.query(sql, (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingStats:', err);
                    reject(err);
                } else {
                    resolve(results[0] || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
                }
            });
        });
    },

    // Search bookings
    searchBookings: async function(searchTerm) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM bookings 
                WHERE full_name LIKE ? 
                   OR phone LIKE ? 
                   OR email LIKE ? 
                   OR service LIKE ?
                ORDER BY created_at DESC
            `;
            
            const searchValue = `%${searchTerm}%`;
            
            pool.query(sql, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
                if (err) {
                    console.error('❌ Database error in searchBookings:', err);
                    reject(err);
                } else {
                    console.log(`✅ Found ${results.length} bookings for search: ${searchTerm}`);
                    resolve(results);
                }
            });
        });
    },

    // Get today's bookings
    getTodayBookings: async function() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE DATE(service_date) = CURDATE() ORDER BY time_slot`;
            
            pool.query(sql, (err, results) => {
                if (err) {
                    console.error('❌ Database error in getTodayBookings:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} bookings for today`);
                    resolve(results);
                }
            });
        });
    },

    // Get bookings by date range
    getBookingsByDateRange: async function(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE service_date BETWEEN ? AND ? ORDER BY service_date, time_slot`;
            
            pool.query(sql, [startDate, endDate], (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingsByDateRange:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} bookings from ${startDate} to ${endDate}`);
                    resolve(results);
                }
            });
        });
    },

    // Get bookings by service type
    getBookingsByService: async function(service) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE service = ? ORDER BY created_at DESC`;
            
            pool.query(sql, [service], (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingsByService:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} bookings for service: ${service}`);
                    resolve(results);
                }
            });
        });
    },

    // Get bookings by area
    getBookingsByArea: async function(area) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE area = ? ORDER BY created_at DESC`;
            
            pool.query(sql, [area], (err, results) => {
                if (err) {
                    console.error('❌ Database error in getBookingsByArea:', err);
                    reject(err);
                } else {
                    console.log(`✅ Retrieved ${results.length} bookings for area: ${area}`);
                    resolve(results);
                }
            });
        });
    }
};

module.exports = bookingModule;