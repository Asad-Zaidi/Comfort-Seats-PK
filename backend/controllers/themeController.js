const Theme = require('../models/Theme');

// @desc    Get all themes
// @route   GET /api/themes
// @access  Private/Admin
exports.getAllThemes = async (req, res) => {
    try {
        const themes = await Theme.find().sort({ createdAt: 1 });
        return res.status(200).json({ success: true, data: themes });
    } catch (error) {
        console.error('Error fetching themes:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching themes.' });
    }
};

// @desc    Get the active theme
// @route   GET /api/themes/active
// @access  Public
exports.getActiveTheme = async (req, res) => {
    try {
        const theme = await Theme.getActiveTheme();
        return res.status(200).json({ success: true, data: theme });
    } catch (error) {
        console.error('Error fetching active theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching active theme.' });
    }
};

// @desc    Get a single theme by ID
// @route   GET /api/themes/:id
// @access  Private/Admin
exports.getThemeById = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }
        return res.status(200).json({ success: true, data: theme });
    } catch (error) {
        console.error('Error fetching theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching theme.' });
    }
};

// @desc    Create a new theme
// @route   POST /api/themes
// @access  Private/Admin
exports.createTheme = async (req, res) => {
    try {
        const { name, description, colors, typography, cards, animations, sections, isActive } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Theme name is required.' });
        }

        const existing = await Theme.findOne({ name: name.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'A theme with this name already exists.' });
        }

        const theme = await Theme.create({
            name: name.trim(),
            description: description || '',
            colors: colors || {},
            typography: typography || {},
            cards: cards || {},
            animations: animations || {},
            sections: sections || {},
            isActive: false,
        });

        if (isActive) {
            await Theme.activateTheme(theme._id);
            theme.isActive = true;
        }

        return res.status(201).json({ success: true, data: theme, message: 'Theme created successfully.' });
    } catch (error) {
        console.error('Error creating theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating theme.' });
    }
};

// @desc    Update a theme
// @route   PUT /api/themes/:id
// @access  Private/Admin
exports.updateTheme = async (req, res) => {
    try {
        const { name, description, colors, typography, cards, animations, sections } = req.body;

        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }

        if (name !== undefined) theme.name = name.trim();
        if (description !== undefined) theme.description = description;

        if (colors !== undefined) {
            // Deep merge colors
            theme.colors = { ...(theme.colors?.toObject ? theme.colors.toObject() : theme.colors), ...colors };
        }
        if (typography !== undefined) {
            theme.typography = { ...(theme.typography?.toObject ? theme.typography.toObject() : theme.typography), ...typography };
        }
        if (cards !== undefined) {
            theme.cards = { ...(theme.cards?.toObject ? theme.cards.toObject() : theme.cards), ...cards };
        }
        if (animations !== undefined) {
            theme.animations = { ...(theme.animations?.toObject ? theme.animations.toObject() : theme.animations), ...animations };
        }
        if (sections !== undefined) {
            theme.sections = { ...(theme.sections?.toObject ? theme.sections.toObject() : theme.sections), ...sections };
        }

        await theme.save();
        return res.status(200).json({ success: true, data: theme, message: 'Theme updated successfully.' });
    } catch (error) {
        console.error('Error updating theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating theme.' });
    }
};

// @desc    Delete a theme
// @route   DELETE /api/themes/:id
// @access  Private/Admin
exports.deleteTheme = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }
        if (theme.isDefault) {
            return res.status(400).json({ success: false, message: 'Cannot delete the default theme.' });
        }
        if (theme.isActive) {
            return res.status(400).json({ success: false, message: 'Cannot delete the active theme. Activate another theme first.' });
        }
        await Theme.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Theme deleted successfully.' });
    } catch (error) {
        console.error('Error deleting theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting theme.' });
    }
};

// @desc    Activate a theme (set as the live theme)
// @route   PUT /api/themes/:id/activate
// @access  Private/Admin
exports.activateTheme = async (req, res) => {
    try {
        const theme = await Theme.activateTheme(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }
        return res.status(200).json({ success: true, data: theme, message: `Theme "${theme.name}" is now active.` });
    } catch (error) {
        console.error('Error activating theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while activating theme.' });
    }
};

// @desc    Duplicate a theme
// @route   POST /api/themes/:id/duplicate
// @access  Private/Admin
exports.duplicateTheme = async (req, res) => {
    try {
        const original = await Theme.findById(req.params.id);
        if (!original) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }

        const baseName = `${original.name} (Copy)`;
        let newName = baseName;
        let counter = 1;
        while (await Theme.findOne({ name: newName })) {
            newName = `${baseName} ${counter++}`;
        }

        const data = original.toObject();
        delete data._id;
        delete data.__v;
        delete data.createdAt;
        delete data.updatedAt;
        data.name = newName;
        data.isActive = false;
        data.isDefault = false;

        const duplicate = await Theme.create(data);
        return res.status(201).json({ success: true, data: duplicate, message: `Theme duplicated as "${newName}".` });
    } catch (error) {
        console.error('Error duplicating theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while duplicating theme.' });
    }
};

// @desc    Export a theme as JSON (returns the theme data directly)
// @route   GET /api/themes/:id/export
// @access  Private/Admin
exports.exportTheme = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }
        const data = theme.toObject();
        delete data._id;
        delete data.__v;
        delete data.isActive;
        delete data.isDefault;
        delete data.createdAt;
        delete data.updatedAt;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${theme.name.replace(/\s+/g, '_')}_theme.json"`);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error exporting theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while exporting theme.' });
    }
};

// @desc    Import a theme from JSON
// @route   POST /api/themes/import
// @access  Private/Admin
exports.importTheme = async (req, res) => {
    try {
        const { name, description, colors, typography, cards, animations, sections } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Theme name is required in the import data.' });
        }

        let finalName = name.trim();
        let counter = 1;
        while (await Theme.findOne({ name: finalName })) {
            finalName = `${name.trim()} (${counter++})`;
        }

        const theme = await Theme.create({
            name: finalName,
            description: description || '',
            colors: colors || {},
            typography: typography || {},
            cards: cards || {},
            animations: animations || {},
            sections: sections || {},
            isActive: false,
        });

        return res.status(201).json({ success: true, data: theme, message: `Theme imported as "${finalName}".` });
    } catch (error) {
        console.error('Error importing theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while importing theme.' });
    }
};

// @desc    Reset a theme to default values
// @route   PUT /api/themes/:id/reset
// @access  Private/Admin
exports.resetTheme = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ success: false, message: 'Theme not found.' });
        }

        // Reset by setting all sub-documents to empty objects (triggers schema defaults)
        theme.colors = {};
        theme.typography = {};
        theme.cards = {};
        theme.animations = {};
        theme.sections = {};
        await theme.save();

        // Reload to get defaults applied
        const updated = await Theme.findById(req.params.id);
        return res.status(200).json({ success: true, data: updated, message: 'Theme reset to defaults.' });
    } catch (error) {
        console.error('Error resetting theme:', error);
        return res.status(500).json({ success: false, message: 'Server error while resetting theme.' });
    }
};
