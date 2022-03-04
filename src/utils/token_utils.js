const {
  verify,
} = require('jsonwebtoken');

const {
  SECRET,
} = require('../config/secret');

const getToken = (req) => {
  const token = req.headers.authorization;
  return token;
};

const validateToken = (token) => {
  const invalidId = '';
  if (token) {
    try {
      const decodedToken = verify(token, SECRET);
      return decodedToken.userId;
    } catch (_) {
      return invalidId;
    }
  }

  return invalidId;
};

module.exports = {
  getToken,
  validateToken,
};