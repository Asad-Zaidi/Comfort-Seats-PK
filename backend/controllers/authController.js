const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (admin) => {
	return jwt.sign(
		{ id: admin._id, role: admin.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '150h' }
	);
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ success: false, message: 'Email and password are required.' });
		}

		const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

		if (!admin) {
			return res.status(401).json({ success: false, message: 'Invalid email or password.' });
		}

		if (!admin.isActive) {
			return res.status(403).json({ success: false, message: 'This admin account has been deactivated.' });
		}

		const isMatch = await admin.comparePassword(password);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Invalid email or password.' });
		}

		admin.lastLogin = new Date();
		await admin.save();

		return res.status(200).json({
			success: true,
			token: generateToken(admin),
			admin: {
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role,
				lastLogin: admin.lastLogin
			}
		});
	} catch (error) {
		console.error('Error logging in admin:', error);
		return res.status(500).json({ success: false, message: 'Server error while logging in.' });
	}
};

// @desc    Change admin password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ success: false, message: 'Current and new password are required.' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
		}

		// req.admin is attached by the protect middleware
		const admin = await Admin.findById(req.admin._id).select('+password');

		if (!admin) {
			return res.status(404).json({ success: false, message: 'Admin account not found.' });
		}

		const isMatch = await admin.comparePassword(currentPassword);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
		}

		// Assigning triggers the pre-save hook that hashes the new password
		admin.password = newPassword;
		await admin.save();

		return res.status(200).json({ success: true, message: 'Password changed successfully.' });
	} catch (error) {
		console.error('Error changing password:', error);
		return res.status(500).json({ success: false, message: 'Server error while changing password.' });
	}
};

// @desc    Get logged in admin
// @route   GET /api/auth/me
// @access  Private
exports.me = async (req, res) => {
	return res.status(200).json({
		success: true,
		admin: {
			id: req.admin._id,
			name: req.admin.name,
			email: req.admin.email,
			role: req.admin.role,
			lastLogin: req.admin.lastLogin
		}
	});
};
