const express = require('express');
const router = express.Router();

const {
    getAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
} = require('../controllers/announcementController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getAnnouncement);
router.put('/', protect, admin(), updateAnnouncement);
router.patch('/', protect, admin(), toggleAnnouncement);

module.exports = router;