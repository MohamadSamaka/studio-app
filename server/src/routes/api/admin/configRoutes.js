const express = require('express');
const router = express.Router();
const configController = require('../../../controllers/configController');

// Public route for users to view the config (no admin rights required)
router.get('/', configController.getConfig);

// Admin route to update the config
router.put('/', configController.updateConfig);

module.exports = router;
