const pool = require('../config/db');

// Get dashboard statistics
const getDashboardStats = async () => {
    return new Promise((resolve, reject) => {
        const stats = {};
        
        // Total bookings
        pool.query('SELECT COUNT(*) as total FROM bookings', (err, result) => {
            if (err) return reject(err);
            stats.total = result[0].total;
            
            // Pending bookings
            pool.query('SELECT COUNT(*) as pending FROM bookings WHERE status = "pending"', (err, result) => {
                if (err) return reject(err);
                stats.pending = result[0].pending;
                
                // Completed bookings
                pool.query('SELECT COUNT(*) as completed FROM bookings WHERE status = "completed"', (err, result) => {
                    if (err) return reject(err);
                    stats.completed = result[0].completed;
                    
                    // Cancelled bookings
                    pool.query('SELECT COUNT(*) as cancelled FROM bookings WHERE status = "cancelled"', (err, result) => {
                        if (err) return reject(err);
                        stats.cancelled = result[0].cancelled;
                        
                        resolve(stats);
                    });
                });
            });
        });
    });
};

// Get contact messages
const getContactMessages = async (limit = null) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
        
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }
        
        pool.query(sql, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    getDashboardStats,
    getContactMessages
};
// Load bookings data
async function loadBookings() {
    try {
        const response = await fetch('/api/admin/bookings');
        const data = await response.json();
        
        if (data.success) {
            renderBookingsTable(data.bookings);
        } else {
            console.error('Error loading bookings:', data.message);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Render bookings in table
function renderBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${booking.full_name}</td>
            <td>${booking.service_type}</td>
            <td>${new Date(booking.service_date).toLocaleDateString()}</td>
            <td>${booking.time_slot}</td>
            <td>${booking.phone}</td>
            <td>${booking.area}</td>
            <td>
                <span class="status-badge status-${booking.status}">
                    ${booking.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info view-booking" data-id="${booking.id}">View</button>
                <button class="btn btn-sm btn-warning edit-booking" data-id="${booking.id}">Edit</button>
            </td>
        </tr>
    `).join('');
}

// Dashboard statistics load karo
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalBookings').textContent = data.stats.total;
            document.getElementById('pendingBookings').textContent = data.stats.pending;
            document.getElementById('completedBookings').textContent = data.stats.completed;
            document.getElementById('cancelledBookings').textContent = data.stats.cancelled;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}


