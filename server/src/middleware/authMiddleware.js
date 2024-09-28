const userRepository = require('../repositories/userRepository');
const { ACCESS_TOKEN_SECRET } = require('../config/env');
const { verifyToken } = require('../utils/tokens');


const authenticateToken = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("Invalid token: No token provided");
    return res.status(401).json({ message: 'Access denied: No token provided' });
  }

  try {
    // Verify the token using your secret
    const decoded = verifyToken(token, ACCESS_TOKEN_SECRET);

    // Fetch the user from the database, including the role relation
    const user = await userRepository.findByIdWithRole(decoded.id);

    if (!user) {
      console.log("Invalid token: User not found");
      return res.status(401).json({ message: 'Access denied: User not found' });
    }

    // Attach the user to the request object for downstream use
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in auth middleware:", err);

    if (err.name === 'TokenExpiredError') {
      // Specific response for expired tokens
      return res.status(401).json({ message: 'Access denied: Token expired' });
    }

    // Generic response for other token verification errors
    return res.status(403).json({ message: 'Access denied: Invalid token' });
  }
};

// Middleware to check if the user is an admin
const checkAdmin = (req, res, next) => {
  const roleName = req.user?.dataValues?.Role?.dataValues?.name?.toLowerCase();

  if (roleName === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

module.exports = {
  authenticateToken,
  checkAdmin,
};

