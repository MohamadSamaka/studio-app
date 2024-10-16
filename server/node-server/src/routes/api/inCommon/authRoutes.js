const express = require('express');
const authController = require('../../../controllers/authController');
const pushTokenController = require('../../../controllers/pushTokenController');
const {authenticateToken} = require('../../../middleware/authMiddleware');


const router = express.Router();

router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/push-token', authenticateToken, pushTokenController.registerToken);
router.get('/user', authenticateToken, (req, res) => {
    res.json({ user: req.user }); // Respond with the authenticated user data
});



module.exports = router;
