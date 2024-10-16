const express = require('express');
const userController = require('../../../controllers/userController');
const notificaitonController = require('../../../controllers/notificationsController');

const router = express.Router();

// Route to update the user's language

router.get('/notification', notificaitonController.getNotificaions);
router.put('/notification/read', notificaitonController.markNotificationAsRead);
router.put('/language', userController.updateLanguage);
// router.post('/register-push-token', userController.registerPushToken);

module.exports = router;
