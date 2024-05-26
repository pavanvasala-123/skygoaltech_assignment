const jwt = require('jsonwebtoken');
require('dotenv').config()


const verifyToken = async (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;

  if (!token) {
    return res.status(403).json({ error: "Access Denied: No token provided" });
  }

  const bearerToken = token.split(' ')[1];

  if (!bearerToken) {
    return res.status(403).json({ error: "Access Denied: Malformed token" });
  }

  try {
    const decoded = await jwt.verify(bearerToken, process.env.secret_access_token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
