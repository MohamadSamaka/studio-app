const express = require('express');
const businessHourController = require('../../../controllers/businessHourController');
const { authenticateToken, checkAdmin } = require('../../../middleware/authMiddleware');

const router = express.Router();

// Apply the authenticateToken middleware to all routes
router.use(authenticateToken);

// Route accessible to both admins and users
router.get('/', businessHourController.getBusinessHours);

// Routes restricted to admins only (applies checkAdmin middleware)
router.use(checkAdmin);

router.post('/', businessHourController.createBusinessHour);
router.put('/:id', businessHourController.updateBusinessHourById);
router.delete('/:id', businessHourController.deleteBusinessHourById);

module.exports = router;
