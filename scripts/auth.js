const pool = require('../config/db');

const auth = {
    // Admin login function
    adminLogin: async (username, password) => {
        return new Promise((resolve, reject) => {
            console.log('Login attempt for username:', username);
            
            const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
            
            pool.query(sql, [username, password], (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    reject(error);
                    return;
                }
                
                console.log('Query results:', results);
                
                if (results.length > 0) {
                    resolve({
                        success: true,
                        admin: results[0]
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }
            });
        });
    },
    
    // Create session after login
    createSession: (req, admin) => {
        req.session.adminId = admin.id;
        req.session.adminName = admin.username;
        req.session.adminFullName = admin.full_name;
        req.session.isAdmin = true;
        req.session.role = admin.role;
        
        console.log('Session created for admin:', admin.username);
    },
    
    // Check if user is authenticated
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.isAdmin) {
            console.log('Authenticated user:', req.session.adminName);
            next();
        } else {
            console.log('Unauthorized access attempt');
            res.redirect('/admin/login');
        }
    },
    
    // Check if user is super admin
    isSuperAdmin: (req, res, next) => {
        if (req.session && req.session.isAdmin && req.session.role === 'super_admin') {
            next();
        } else {
            res.redirect('/admin/dashboard');
        }
    },
    
    // Logout function
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/admin/login');
        });
    }
};

module.exports = auth;