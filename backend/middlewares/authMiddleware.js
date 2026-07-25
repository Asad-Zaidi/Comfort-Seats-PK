const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verifies the JWT and attaches the admin document to req.admin
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Not authorized. Admin no longer exists.' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: 'This admin account has been deactivated.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
    }
};

// Restricts access to specific roles. Usage: admin(['admin'])
exports.admin = (roles = ['admin']) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: 'Access denied. Insufficient privileges.' });
        }
        next();
    };
};