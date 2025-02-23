import express from 'express';
import { registerAdmin, loginAdmin, updateAdmin } from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rate.middleware.js';

const router = express.Router();

// Apply rate limit to registration route
router.post("/register", rateLimiter, registerAdmin);

// Login route for admin
router.post("/login", loginAdmin);

// Update Admin
router.put("/:adminId", updateAdmin);

export default router;
