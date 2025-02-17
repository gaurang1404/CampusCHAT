import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter to avoid excessive registration attempts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limit to registration route
router.post("/register", limiter, registerAdmin);

// Login route for admin
router.post("/login", loginAdmin);

// Example of a protected route
router.get("/protected", authenticateJWT, (req, res) => {
  res.status(200).json({
    message: "This is a protected route",
    user: req.user,
  });
});

export default router;
