const bcrypt = require("bcryptjs");
const { PASSWORD_HASHING_SEED } = require("../config/env");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, PASSWORD_HASHING_SEED);
};

const comparePassword = async (inputPassword, storedPassword) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
