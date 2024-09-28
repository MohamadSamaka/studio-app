const express = require('express');
const availabilityExceptionController = require('../../../controllers/availabilityExceptionController');

const router = express.Router();

router.get('/', availabilityExceptionController.getAvailabilityExceptions);
router.post('/', availabilityExceptionController.createAvailabilityException);
router.put('/:id', availabilityExceptionController.updateAvailabilityException);
router.delete('/:id', availabilityExceptionController.deleteAvailabilityException);

module.exports = router;
