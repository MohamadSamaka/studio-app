const authService = require('../services/authService');
const userRepository = require('../services/userService')
// const tokenUtils = require('../utils/tokens')
const { verifyToken } = require('../utils/tokens');
const { ACCESS_TOKEN_SECRET } = require('../config/env');
const { trimString } = require("../utils/helpers")


class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const trimmedUserName = trimString(username)
      const { user, accessToken, refreshToken } = await authService.loginUser(trimmedUserName, password);
      res.json({ user, accessToken, refreshToken });
    } catch (error) {
      console.log("Failed To Login")
      res.status(401).json({ error: error.message || 'Invalid credentials' });
    }
  }

  async refreshToken(req, res) {
    try {
      const XOuthHeader = req.headers['x-refresh-token'];
      const refreshToken = XOuthHeader.split(' ')[1];
      const newTokens = await authService.refreshTokens(refreshToken);
      res.json(newTokens);
    } catch (error) {
      console.log("Error from refresh:", error);
      // Determine the error type
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh token expired' });
      }
      return res.status(401).json({ message: error.message || 'Invalid refresh token' });
    }
  }

  async logout(req, res) {
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token missing from header' });
      }

      // Verify the token
      try {
        let decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by the token
      // console.log("token is: ", token)
      const user = await userRepository.getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Invalidate tokens by setting them to null
      await userRepository.nullifyUserTokens(user.id);

      return res.status(200).json({ message: 'User logged out successfully' });
      
    } catch (error) {
      console.error('Error during logout:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

}

module.exports = new AuthController();

