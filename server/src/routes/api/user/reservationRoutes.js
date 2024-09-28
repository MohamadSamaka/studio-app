const express = require('express');
const reservationController = require('../../../controllers/reservationController');

const router = express.Router();

// Existing routes
// router.get('/', reservationController.getReservations);
router.get('/', reservationController.getUserReservations);
router.get('/organized', reservationController.getOrganizedReservationsByDateAndTime);

router.post('/', reservationController.createReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);



module.exports = router;
