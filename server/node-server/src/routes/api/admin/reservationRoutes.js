const express = require('express');
const availableReservationController = require('../../../controllers/availableReservationsController');

const router = express.Router();

// router.get('/', reservationController.getOrganizedReservationsByDateAndTime);
router.get('/paginated', availableReservationController.getPaginatedReservationsByDateAndTime);
router.post('/', availableReservationController.createReservationSlot)

router.delete('/:id', availableReservationController.deleteReservation);
router.delete('/:id/users/:userId', availableReservationController.removeUserFromReservation);


module.exports = router;
