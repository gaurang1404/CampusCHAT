import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Removing 'Bearer ' from the token if included
  const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

  try {
    // Verifying the token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);
    req.adminId = decoded.adminId;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
