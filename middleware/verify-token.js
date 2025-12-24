const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if header exists
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // 2️⃣ Check format
    const parts = authHeader.split(' ');
    if (parts[0] !== 'Bearer' || !parts[1]) {
      return res.status(401).json({ message: 'Token format invalid' });
    }

    const token = parts[1];

    // 3️⃣ Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user
    req.user = payload;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
