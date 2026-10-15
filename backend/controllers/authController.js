const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendPasswordResetOtpEmail, sendPasswordChangedAlertEmail } = require('../services/emailService');
const { validateStrongPassword } = require('../utils/passwordPolicy');
const { extractClientDeviceInfo } = require('../utils/deviceHelper');

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

		// req.admin is attached by the protect middleware
		const admin = await Admin.findById(req.admin._id).select('+password');

		if (!admin) {
			return res.status(404).json({ success: false, message: 'Admin account not found.' });
		}

		const { validateStrongPassword } = require('../utils/passwordPolicy');
		const passwordCheck = validateStrongPassword(newPassword, { email: admin.email, name: admin.name });
		if (!passwordCheck.isValid) {
			return res.status(400).json({ success: false, message: passwordCheck.message });
		}

		const isMatch = await admin.comparePassword(currentPassword);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
		}

		// Prevent reusing the same password
		const isSameAsPrevious = await admin.comparePassword(newPassword);
		if (isSameAsPrevious) {
			return res.status(400).json({
				success: false,
				message: 'New password cannot be the same as your previous password. Please choose a different password.'
			});
		}

		// Assigning triggers the pre-save hook that hashes the new password
		admin.password = newPassword;
		await admin.save();

		// Extract device details (IP, device/browser name, geolocation)
		const deviceInfo = extractClientDeviceInfo(req);

		// Dispatch security alert to BOTH admin email and backup email
		sendPasswordChangedAlertEmail({
			adminEmail: admin.email,
			adminName: admin.name,
			method: 'Admin Dashboard Settings',
			deviceInfo
		}).catch((err) => console.error('[authController] Password alert email failed:', err.message));

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

// @desc    Initiate forgot password: send 6-digit OTP to designated backup email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ success: false, message: 'Admin email is required.' });
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(normalizedEmail)) {
			return res.status(400).json({ success: false, message: 'Please enter a valid email address format.' });
		}

		const admin = await Admin.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordOtpExpires');

		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'No admin account found with that email address.'
			});
		}

		if (!admin.isActive) {
			return res.status(403).json({
				success: false,
				message: 'This admin account has been deactivated.'
			});
		}

		// Generate cryptographically secure 6-digit OTP
		const otp = crypto.randomInt(100000, 999999).toString();

		// Hash OTP before saving to database
		const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

		// Set OTP and 10-minute expiry
		admin.resetPasswordOtp = hashedOtp;
		admin.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
		await admin.save();

		// Send OTP directly to backup email along with device & IP info
		const backupEmail = process.env.BACKUP_EMAIL || 'saqibtariq1619@gmail.com';
		const deviceInfo = extractClientDeviceInfo(req);
		await sendPasswordResetOtpEmail({
			adminEmail: admin.email,
			adminName: admin.name,
			otp,
			deviceInfo
		});

		// Mask backup email for UI display (e.g. s***q@gmail.com)
		const parts = backupEmail.split('@');
		const maskedUser = parts[0].length > 2
			? `${parts[0][0]}***${parts[0][parts[0].length - 1]}`
			: `${parts[0][0]}***`;
		const maskedBackupEmail = `${maskedUser}@${parts[1] || 'gmail.com'}`;

		return res.status(200).json({
			success: true,
			message: `A 6-digit OTP verification code has been sent to the backup email (${maskedBackupEmail}).`,
			backupEmailMasked: maskedBackupEmail
		});
	} catch (error) {
		console.error('Error in forgotPassword:', error);
		return res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
	}
};

// @desc    Verify OTP in real-time
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const hashedOtp = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

		const admin = await Admin.findOne({
			email: normalizedEmail,
			resetPasswordOtp: hashedOtp,
			resetPasswordOtpExpires: { $gt: new Date() }
		});

		if (!admin) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired OTP code.'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'OTP code verified successfully.'
		});
	} catch (error) {
		console.error('Error in verifyOtp:', error);
		return res.status(500).json({ success: false, message: 'Server error while verifying OTP.' });
	}
};

// @desc    Reset password using 6-digit OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPasswordWithOtp = async (req, res) => {
	try {
		const { email, otp, newPassword } = req.body;

		if (!email || !otp || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Email, OTP code, and new password are all required.'
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(normalizedEmail)) {
			return res.status(400).json({ success: false, message: 'Please enter a valid email address format.' });
		}

		const hashedOtp = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

		// Find admin with matching active OTP and valid expiry window
		const admin = await Admin.findOne({
			email: normalizedEmail,
			resetPasswordOtp: hashedOtp,
			resetPasswordOtpExpires: { $gt: new Date() }
		}).select('+password +resetPasswordOtp +resetPasswordOtpExpires');

		if (!admin) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired OTP verification code.'
			});
		}

		// Validate strong password rules (12+ chars, uppercase, lowercase, number, special char)
		const passwordCheck = validateStrongPassword(newPassword, { email: admin.email, name: admin.name });
		if (!passwordCheck.isValid) {
			return res.status(400).json({
				success: false,
				message: passwordCheck.message
			});
		}

		// Prevent reusing the same previous password
		const isSameAsPrevious = await admin.comparePassword(newPassword);
		if (isSameAsPrevious) {
			return res.status(400).json({
				success: false,
				message: 'New password cannot be the same as your previous password. Please choose a different password.'
			});
		}

		// Update password (triggers bcrypt hash pre-save hook) and clear OTP
		admin.password = newPassword;
		admin.resetPasswordOtp = undefined;
		admin.resetPasswordOtpExpires = undefined;
		await admin.save();

		// Extract device details (IP, device/browser name, geolocation)
		const deviceInfo = extractClientDeviceInfo(req);

		// Dispatch security alert to BOTH admin email and backup email
		sendPasswordChangedAlertEmail({
			adminEmail: admin.email,
			adminName: admin.name,
			method: 'Forgot Password (Backup Email OTP)',
			deviceInfo
		}).catch((err) => console.error('[authController] Password reset alert email failed:', err.message));

		return res.status(200).json({
			success: true,
			message: 'Password reset successfully. You can now log in with your new password.'
		});
	} catch (error) {
		console.error('Error in resetPasswordWithOtp:', error);
		return res.status(500).json({ success: false, message: 'Server error while resetting password.' });
	}
};

