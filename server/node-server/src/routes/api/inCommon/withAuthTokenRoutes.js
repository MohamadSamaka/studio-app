const express = require('express');
const NotificaitonController = require('../../../controllers/notificationsController');
const {authenticateToken} = require('../../../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, NotificaitonController.getNotificaions);


module.exports = router;
