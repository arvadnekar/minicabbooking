const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Check token from cookie or Authorization header
  const token = req.cookies.token || 
                (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") 
                  ? req.headers.authorization.split(" ")[1] 
                  : null);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
