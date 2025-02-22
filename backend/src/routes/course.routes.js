import express from "express";
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to course creation route
router.post("/add", authenticateJWT, rateLimiter, addCourse);

// Route to get all courses (protected)
router.get("/", authenticateJWT, getCourses);

// Route to get a single course by ID (protected)
router.get("/:id", authenticateJWT, getCourseById);

// Route to update course details (protected)
router.put("/:id", authenticateJWT, updateCourse);

// Route to delete a course (protected)
router.delete("/:id", authenticateJWT, deleteCourse);

export default router;
