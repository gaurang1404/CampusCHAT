import express from 'express';
import { addDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from '../controllers/department.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rate.middleware.js';

const router = express.Router();

// Apply rate limit to the department creation route
router.post("/add", authenticateJWT, rateLimiter, addDepartment);

// Route to get all departments (protected)
router.get("/", authenticateJWT, getDepartments);

// Route to get a single department by ID (protected)
router.get("/:id", authenticateJWT, getDepartmentById);

// Route to update department details (protected)
router.put("/:id", authenticateJWT, updateDepartment);

// Route to delete a department (protected)
router.delete("/:id", authenticateJWT, deleteDepartment);

export default router;
