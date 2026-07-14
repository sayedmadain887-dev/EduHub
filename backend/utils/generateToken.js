const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token containing the user's ID and role.
 * Used after successful login/register to authenticate future requests.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;