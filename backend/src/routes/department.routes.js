import express from 'express';
import { addDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from '../controllers/department.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter to avoid excessive requests for department actions
const departmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limit to the department creation route
router.post("/add", authenticateJWT, departmentLimiter, addDepartment);

// Route to get all departments (protected)
router.get("/", authenticateJWT, getDepartments);

// Route to get a single department by ID (protected)
router.get("/:id", authenticateJWT, getDepartmentById);

// Route to update department details (protected)
router.put("/:id", authenticateJWT, updateDepartment);

// Route to delete a department (protected)
router.delete("/:id", authenticateJWT, deleteDepartment);

export default router;
