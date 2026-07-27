const express = require('express');
const router = express.Router();
const {
    getAllThemes,
    getActiveTheme,
    getThemeById,
    createTheme,
    updateTheme,
    deleteTheme,
    activateTheme,
    duplicateTheme,
    exportTheme,
    importTheme,
    resetTheme,
} = require('../controllers/themeController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public — the live site fetches the active theme to apply CSS vars
router.get('/active', getActiveTheme);

// Admin protected
router.get('/', protect, admin(), getAllThemes);
router.get('/:id', protect, admin(), getThemeById);
router.post('/', protect, admin(), createTheme);
router.put('/:id', protect, admin(), updateTheme);
router.delete('/:id', protect, admin(), deleteTheme);
router.put('/:id/activate', protect, admin(), activateTheme);
router.post('/:id/duplicate', protect, admin(), duplicateTheme);
router.get('/:id/export', protect, admin(), exportTheme);
router.post('/import', protect, admin(), importTheme);
router.put('/:id/reset', protect, admin(), resetTheme);

module.exports = router;
