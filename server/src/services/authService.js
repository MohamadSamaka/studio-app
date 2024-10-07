const userRepository = require("../repositories/userRepository");
const tokenUtils = require("../utils/tokens");
const { comparePassword } = require("../utils/hashUtils");
const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = require("../config/env");

class AuthService {
  async registerUser(username, password) {
    await userRepository.create({ username, password });
  }

  async loginUser(username, password) {
    const user = await userRepository.findByUsername(username);

    const roleName = user.Role.name;

    if (user && (await comparePassword(password, user.password))) {
      // Generate tokens once
      const accessToken = tokenUtils.generateAccessToken({
        id: user.id,
        username: user.username,
        role: roleName,
      });
      const refreshToken = tokenUtils.generateRefreshToken({
        id: user.id,
        username: user.username,
        role: roleName,
      });

      // Store the same tokens in the database
      await userRepository.updateTokens(user.id, accessToken, refreshToken);

      // Update the user object to include these tokens (if needed)
      user.token = accessToken;
      user.refreshToken = refreshToken;

      const userWithoutPassword = user.toJSON(); // Convert Sequelize instance to plain object
      delete userWithoutPassword.password;
      delete userWithoutPassword.token;
      delete userWithoutPassword.refreshToken;

      // Return the same tokens and user data

      return { user: userWithoutPassword, accessToken, refreshToken };
    }
    throw new Error("Username or password incorrect");
  }

  async refreshTokens(refreshToken) {
    const user = await userRepository.findByRefreshToken(refreshToken);

    if (!user) throw new Error("Invalid refresh token");

    // Verify that the refresh token is valid
    tokenUtils.verifyToken(refreshToken, REFRESH_TOKEN_SECRET);

    const roleName = user.Role.name;

    const newAccessToken = tokenUtils.generateAccessToken({
      id: user.id,
      username: user.username,
      role: roleName,
    });

    const newRefreshToken = tokenUtils.generateRefreshToken({
      id: user.id,
      username: user.username,
      role: roleName,
    });

    // Update the access token in the database (optional, depending on your use case)
    await userRepository.updateTokens(user.id, newAccessToken, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logoutUser(token) {
    // Verify the token before proceeding
    tokenUtils.verifyToken(token, ACCESS_TOKEN_SECRET);

    const user = await userRepository.findByToken(token);
    if (!user) throw new Error("Invalid token");

    // Invalidate tokens by setting them to null
    await userRepository.updateTokens(user.id, null, null);
    console.log("User logged out successfully");
  }

  async invalidateOldTokens(userId) {
    // Clear any existing tokens for the user
    await userRepository.updateTokens(userId, null, null);
  }
}

module.exports = new AuthService();
