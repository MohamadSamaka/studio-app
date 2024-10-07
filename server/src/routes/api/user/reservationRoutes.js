const express = require('express');
const availableReservationController = require('../../../controllers/availableReservationsController');

const router = express.Router();

// Existing routes
// router.get('/', reservationController.getReservations);
router.get('/', availableReservationController.getUserReservations);
router.get('/organized', availableReservationController.getOrganizedReservationsByDateAndTime);

router.post('/', availableReservationController.bookReservation);
router.put('/:id', availableReservationController.updateReservation);
router.delete('/:id', availableReservationController.deleteReservation);



module.exports = router;
