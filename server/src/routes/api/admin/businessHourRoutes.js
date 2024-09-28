const express = require('express');
const businessHourController = require('../../../controllers/businessHourController');

const router = express.Router();

router.get('/', businessHourController.getBusinessHours);
router.post('/', businessHourController.createBusinessHour);
router.put('/:dayOfWeek', businessHourController.updateBusinessHourByDateOfWeek);
// router.put('/business-hours/:dayOfWeek', businessHourController.updateBusinessHour);

// router.delete('/:id', businessHourController.deleteBusinessHour);
router.delete('/:dayOfWeek', businessHourController.deleteBusinessHourByDateOfWeek);

module.exports = router;
