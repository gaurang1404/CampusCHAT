import express from "express";
import {
  addFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  updateFacultyDesignation,
  getFacultySections,
  getFacultySemesters,
  loginFaculty,
} from "../controllers/faculty.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to faculty creation route
router.post("/add", authenticateJWT, rateLimiter, addFaculty);

router.post("/login", loginFaculty);

// Route to get all faculties (protected)
router.get("/", authenticateJWT, getFaculties);

// Route to get a single faculty by ID (protected)
router.get("/:id", authenticateJWT, getFacultyById);

router.get("/:id/sections", authenticateJWT, getFacultySections);

router.get("/:id/semesters", authenticateJWT, getFacultySemesters);

// Route to update faculty details (protected)
router.put("/:id", authenticateJWT, updateFaculty);


// Route to update faculty designation (protected)
router.patch("/:id/designation", authenticateJWT, updateFacultyDesignation);

// Route to delete a faculty (protected)
router.delete("/:id", authenticateJWT, deleteFaculty);

export default router;
