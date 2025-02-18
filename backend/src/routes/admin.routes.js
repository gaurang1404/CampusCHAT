import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rate.middleware.js';

const router = express.Router();

// Apply rate limit to registration route
router.post("/register", rateLimiter, registerAdmin);

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
