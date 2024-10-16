const express = require('express');
const businessHourController = require('../../../controllers/businessHourController');

const router = express.Router();

router.get('/', businessHourController.getBusinessHours);
router.get('/business-calendar', businessHourController.getBusinessCalendar);




module.exports = router;
