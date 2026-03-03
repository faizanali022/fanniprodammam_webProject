// ========== REQUIRED MODULES ==========
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ========== DATABASE CONFIGURATION ==========
const pool = require('./config/db');

// Import server-side modules (NOT client-side)
// const booking = require('./js/booking'); // ❌ REMOVE THIS - client-side hai yeh
const auth = require('./scripts/auth');
const admin = require('./scripts/admin');

// Add server-side booking module (create this file)
// First, we'll define the functions directly here, then you can move to separate file

// ========== SERVER-SIDE BOOKING FUNCTIONS ==========
const bookingFunctions = {
    createBooking: function(bookingData) {
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
                    console.error('Error creating booking:', err);
                    reject(err);
                } else {
                    resolve({ bookingId: result.insertId });
                }
            });
        });
    },

    getAllBookings: function(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings ORDER BY created_at DESC LIMIT ?`;
            pool.query(sql, [limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    getBookingsWithFilters: function(filters) {
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
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    getBookingById: function(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM bookings WHERE id = ?`;
            pool.query(sql, [id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0] || null);
            });
        });
    },

    updateBookingStatus: function(id, status) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?`;
            pool.query(sql, [status, id], (err, result) => {
                if (err) reject(err);
                else resolve({ affectedRows: result.affectedRows });
            });
        });
    },

    deleteBooking: function(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM bookings WHERE id = ?`;
            pool.query(sql, [id], (err, result) => {
                if (err) reject(err);
                else resolve({ affectedRows: result.affectedRows });
            });
        });
    }
};

// ========== MIDDLEWARE SETUP ==========
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fanni-pro-dammam-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// ========== CUSTOM MIDDLEWARE ==========
// Request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Add user/session info to response locals
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.isAdmin = req.session.isAdmin;
    next();
});

// Database connection middleware
app.use((req, res, next) => {
    pool.query('SELECT 1', (err) => {
        if (err) {
            console.error('❌ Database connection issue:', err.message);
        }
    });
    next();
});

// ========== FRONTEND ROUTES (HTML PAGES) ==========

// Home page
app.get('/', (req, res) => {
    res.render('index.html');
});

// About page
app.get('/about', (req, res) => {
    res.render('about.html');
});

// Services page
app.get('/services', (req, res) => {
    res.render('services.html');
});

// Contact page
app.get('/contact', (req, res) => {
    res.render('contact.html');
});

// Booking page
app.get('/booking', (req, res) => {
    res.render('booking.html');
});

// ========== ADMIN ROUTES ==========

// Admin login page
app.get('/admin/login', (req, res) => {
    if (req.session.isAdmin) {
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin-login.html');
    }
});

// Admin dashboard (protected)
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    res.render('admin-panel.html');
});

// Admin logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// ========== API ROUTES ==========

// ===== CONTACT FORM API =====
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }
        
        // Save to database
        const sql = `
            INSERT INTO contact_messages 
            (name, email, phone, service, message, status) 
            VALUES (?, ?, ?, ?, ?, 'unread')
        `;
        
        pool.query(sql, [name, email, phone, service || null, message], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error saving message'
                });
            }
            
            res.json({
                success: true,
                message: 'Message sent successfully! We will contact you within 2 hours.',
                messageId: result.insertId
            });
        });
        
    } catch (error) {
        console.error('Contact API error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===== BOOKING API =====
app.post('/api/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Validate required fields
        const requiredFields = ['service', 'serviceDate', 'timeSlot', 'fullName', 'phone', 'area', 'address'];
        const missingFields = requiredFields.filter(field => !bookingData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        // Validate phone number
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(bookingData.phone.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number'
            });
        }
        
        // Validate date (not in past)
        const bookingDate = new Date(bookingData.serviceDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Booking date cannot be in the past'
            });
        }
        
        // Use booking functions to save booking
        const result = await bookingFunctions.createBooking(bookingData);
        
        res.json({
            success: true,
            message: 'Booking submitted successfully! We will contact you within 2 hours.',
            bookingId: result.bookingId
        });
        
    } catch (error) {
        console.error('Booking API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting booking'
        });
    }
});

// ===== ADMIN API ROUTES =====

// Admin login API
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        const result = await auth.adminLogin(username, password);
        
        if (result.success) {
            // Create session
            req.session.isAdmin = true;
            req.session.adminName = result.admin.username;
            
            res.json({ 
                success: true,
                redirect: '/admin/dashboard'
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message || 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Check admin authentication
app.get('/api/admin/check-auth', (req, res) => {
    res.json({ 
        authenticated: !!req.session.isAdmin,
        adminName: req.session.adminName
    });
});

// Get dashboard statistics
app.get('/api/admin/dashboard', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        // Get bookings count
        const [bookings] = await pool.promise().query('SELECT COUNT(*) as total FROM bookings');
        const [messages] = await pool.promise().query('SELECT COUNT(*) as total FROM contact_messages WHERE status = "unread"');
        
        const stats = {
            totalBookings: bookings[0].total,
            pendingBookings: 0, // You can add logic to count pending bookings
            unreadMessages: messages[0].total,
            totalRevenue: 0 // Add revenue logic if you have payments
        };
        
        const recentBookings = await bookingFunctions.getAllBookings(5);
        
        res.json({
            success: true,
            stats,
            recentBookings
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading dashboard'
        });
    }
});

// Get all bookings with pagination and filters
app.get('/api/admin/bookings', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const filters = {
            status: req.query.status,
            date: req.query.date,
            service: req.query.service
        };
        
        // Get filtered bookings
        const filteredBookings = await bookingFunctions.getBookingsWithFilters(filters);
        
        // Get total count for pagination
        const totalCount = filteredBookings.length;
        const paginatedBookings = filteredBookings.slice(offset, offset + limit);
        const totalPages = Math.ceil(totalCount / limit);
        
        res.json({
            success: true,
            bookings: paginatedBookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
        
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading bookings'
        });
    }
});

// Get single booking details
app.get('/api/admin/bookings/:id', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const bookingData = await bookingFunctions.getBookingById(req.params.id);
        
        if (!bookingData) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            booking: bookingData
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading booking details'
        });
    }
});

// Update booking status
app.put('/api/admin/bookings/:id/status', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const { status } = req.body;
        
        if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const result = await bookingFunctions.updateBookingStatus(req.params.id, status);
        
        res.json({
            success: true,
            message: `Booking status updated to ${status}`
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking'
        });
    }
});

// Delete booking
app.delete('/api/admin/bookings/:id', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const result = await bookingFunctions.deleteBooking(req.params.id);
        res.json({
            success: true,
            message: 'Booking deleted successfully',
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting booking'
        });
    }
});

// Get contact messages
app.get('/api/admin/messages', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const [messages] = await pool.promise().query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading messages'
        });
    }
});

// Update message status
app.put('/api/admin/messages/:id/status', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    
    try {
        const { status } = req.body;
        
        if (!status || !['unread', 'read', 'replied', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const [result] = await pool.promise().query(
            'UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, req.params.id]
        );
        
        res.json({
            success: true,
            message: `Message status updated to ${status}`
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating message'
        });
    }
});

// ========== ERROR HANDLING ==========

// 404 Error - Page not found
app.use((req, res, next) => {
    res.status(404).render('404.html', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// 500 Error - Server error
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).render('500.html', {
        title: 'Server Error',
        message: 'Something went wrong on our server. Please try again later.'
    });
});
// Debug route - Test bookings
app.get('/debug/bookings', async (req, res) => {
    try {
        const [bookings] = await pool.promise().query('SELECT * FROM bookings');
        res.json({
            count: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Debug route - Test database
app.get('/debug/db', async (req, res) => {
    try {
        const [tables] = await pool.promise().query('SHOW TABLES');
        res.json({
            tables: tables,
            message: 'Database connected successfully'
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});
// ========== SERVER START ==========
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║          🛠️  FANNI PRO DAMMAM - SERVER STARTED          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  🌐 Server URL: http://localhost:${PORT}                    ║
║  📁 Environment: ${process.env.NODE_ENV || 'development'}               ║
║  🗄️  Database: Connected to MySQL                     ║
║                                                          ║
║  📍 Available Routes:                                   ║
║     • Home:          http://localhost:${PORT}/             ║
║     • About:         http://localhost:${PORT}/about        ║
║     • Services:      http://localhost:${PORT}/services     ║
║     • Contact:       http://localhost:${PORT}/contact      ║
║     • Booking:       http://localhost:${PORT}/booking      ║
║     • Admin Login:   http://localhost:${PORT}/admin/login  ║
║                                                          ║
║  🔐 Default Admin Credentials:                          ║
║     • Username: admin                                   ║
║     • Password: admin123                                ║
║     ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!       ║
║                                                          ║
║  📊 Database Tables Created Automatically               ║
║  🚀 Server is running... Press Ctrl+C to stop          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Server is shutting down...');
    
    pool.end((err) => {
        if (err) {
            console.error('Error closing database connection:', err);
        } else {
            console.log('✅ Database connection closed');
        }
        
        process.exit(0);
    });
});