const express = require('express');
const rechargeCreditRequestController = require('../../../controllers/rechargeCreditRequestController');
const router = express.Router();

router.get('/', rechargeCreditRequestController.getUserRequests);
router.post('/', rechargeCreditRequestController.createRequest);
router.delete('/:id', rechargeCreditRequestController.deleteRequest);


module.exports = router;
