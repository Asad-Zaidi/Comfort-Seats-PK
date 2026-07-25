const express = require('express');
const router = express.Router();

const {
    getSiteContent,
    updateHomeBanner,
    updateCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateWhyChooseUs,
    updateBusinessHours,
    updateSiteSettings,
    updateAboutUs,
    updatePolicies,
    updateQuoteSection,
    updateColors,
    updateDelivery
} = require('../controllers/siteContentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadBannerImage, uploadHomeBannerImages, uploadCategoryImage } = require('../middlewares/uploadMiddleware');

router.get('/', getSiteContent);
router.put('/home-banner', protect, admin(), uploadHomeBannerImages, updateHomeBanner);
router.put('/categories', protect, admin(), updateCategories);
router.post('/categories', protect, admin(), uploadCategoryImage, addCategory);
router.put('/categories/:id', protect, admin(), uploadCategoryImage, updateCategory);
router.delete('/categories/:id', protect, admin(), deleteCategory);
router.put('/why-choose-us', protect, admin(), updateWhyChooseUs);
router.put('/business-hours', protect, admin(), updateBusinessHours);
router.put('/settings', protect, admin(), updateSiteSettings);
router.put('/about-us', protect, admin(), uploadBannerImage, updateAboutUs);
router.put('/policies', protect, admin(), updatePolicies);
router.put('/colors', protect, admin(), updateColors);
router.put('/quote-section', protect, admin(), updateQuoteSection);
router.put('/delivery', protect, admin(), updateDelivery);

module.exports = router;
