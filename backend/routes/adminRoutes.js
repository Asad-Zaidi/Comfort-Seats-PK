const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// This is a placeholder route to demonstrate the fix.
// The error "Cannot POST /api/admin/" suggests your frontend
// might be trying to post to the base /api/admin path.
router.post('/', protect, admin(), (req, res) => {
    res.json({ message: "Admin route is working!" });
});

// You can add more admin-specific routes here in the future.

module.exports = router;