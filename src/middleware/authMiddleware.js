exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.adminId) {
        next();
    } else {
        if (req.xhr || req.headers.accept?.includes('json')) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        } else {
            res.redirect('/admin/login');
        }
    }
};

exports.isSuperAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
};