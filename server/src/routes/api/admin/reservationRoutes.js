const express = require('express');
const reservationController = require('../../../controllers/reservationController');

const router = express.Router();

router.get('/', reservationController.getOrganizedReservationsByDateAndTime);
router.get('/paginated', reservationController.getPaginatedReservationsByDateAndTime);

router.delete('/:id', reservationController.deleteReservation);
router.delete('/:id/users/:userId', reservationController.removeUserFromReservation);


module.exports = router;
