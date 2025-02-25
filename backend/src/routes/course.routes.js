import express from "express";
import {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getOpenCourses,
  getClosedCourses,
  getWaitlistedCourses,
} from "../controllers/course.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to course creation route
router.post("/add", authenticateJWT, rateLimiter, addCourse);

// Route to get all courses (protected)
router.get("/", authenticateJWT, getCourses);

// Route to get open courses (protected)
router.get("/open", authenticateJWT, getOpenCourses);

// Route to get all courses (protected)
router.get("/closed", authenticateJWT, getClosedCourses);

// Route to get all courses (protected)
router.get("/waitlisted", authenticateJWT, getWaitlistedCourses);

// Route to get a single course by ID (protected)
router.get("/:id", authenticateJWT, getCourseById);

// Route to get a single course by ID (protected)
router.patch("/:id/status", authenticateJWT, updateCourseStatus);

// Route to update course details (protected)
router.patch("/:id", authenticateJWT, updateCourse);

// Route to delete a course (protected)
router.delete("/:id", authenticateJWT, deleteCourse);

export default router;
