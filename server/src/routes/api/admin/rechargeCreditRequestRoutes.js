const express = require('express');
const rechargeCreditRequestController = require('../../../controllers/rechargeCreditRequestController');
const router = express.Router();

router.get('/', rechargeCreditRequestController.getAllRequests);
router.get('/:id', rechargeCreditRequestController.getRequest);

router.put('/:id', rechargeCreditRequestController.updateRequestStatus );

router.delete('/:id', rechargeCreditRequestController.deleteRequest);

module.exports = router;
