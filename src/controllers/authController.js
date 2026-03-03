const Admin = require('../models/Admin');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findByUsername(username);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await Admin.verifyPassword(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        await Admin.updateLastLogin(admin.id);

        // Create session
        req.session.adminId = admin.id;
        req.session.adminName = admin.username;
        req.session.role = admin.role;

        res.json({ 
            success: true, 
            redirect: '/admin/dashboard',
            admin: { id: admin.id, username: admin.username, role: admin.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.error('Logout error:', err);
        res.redirect('/admin/login');
    });
};

exports.getCurrentAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        res.json({ 
            success: true, 
            admin: { 
                id: admin.id, 
                username: admin.username, 
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};