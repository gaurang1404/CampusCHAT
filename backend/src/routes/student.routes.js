import express from "express";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to student creation route
router.post("/add", authenticateJWT, rateLimiter, addStudent);

// Route to get all students (protected)
router.get("/", authenticateJWT, getStudents);

// Route to get a single student by ID (protected)
router.get("/:id", authenticateJWT, getStudentById);

// Route to update student details (protected)
router.put("/:id", authenticateJWT, updateStudent);

// Route to delete a student (protected)
router.delete("/:id", authenticateJWT, deleteStudent);

export default router;
