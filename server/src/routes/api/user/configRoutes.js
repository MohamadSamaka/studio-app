const express = require('express');
const router = express.Router();
const configController = require('../../../controllers/configController');
const { authenticateToken, checkAdmin } = require('../../../middleware/authMiddleware');

// Public route for users to view the config (no admin rights required)
router.get('/', authenticateToken, configController.getConfig);

module.exports = router;
