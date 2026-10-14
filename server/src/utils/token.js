const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set');
  }

  return process.env.JWT_SECRET;
};

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken, getJwtSecret };
