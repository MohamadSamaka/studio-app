const express = require('express');
const subscriptionController = require('../../../controllers/subscriptionController');
const rechargeCreditController = require('../../../controllers/rechargeCreditRequestController');
const { authenticateToken } = require('../../../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, subscriptionController.getActiveSubscriptions);
router.post('/request', authenticateToken, rechargeCreditController.createRequest);


module.exports = router;
