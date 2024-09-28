const jwt = require('jsonwebtoken');
const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = require('../config/env');

const generateAccessToken = (user) => {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION }); // Use expiresIn
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION }); // Use expiresIn
};

const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

const decodeToken = (token) => {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decoded;
}

const decodeRefreshToken = (refreshToken) => {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    return decoded;
}


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    decodeRefreshToken
};
