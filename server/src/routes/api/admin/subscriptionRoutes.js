const express = require('express');
const subscriptionController = require('../../../controllers/subscriptionController');

const router = express.Router();

router.get('/', subscriptionController.getSubscriptions);
router.post('/', subscriptionController.createSubscription);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
