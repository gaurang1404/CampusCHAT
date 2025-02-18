import express from "express";
import {
  addFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} from "../controllers/faculty.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to faculty creation route
router.post("/add", authenticateJWT, rateLimiter, addFaculty);

// Route to get all faculties (protected)
router.get("/", authenticateJWT, getFaculties);

// Route to get a single faculty by ID (protected)
router.get("/:id", authenticateJWT, getFacultyById);

// Route to update faculty details (protected)
router.put("/:id", authenticateJWT, updateFaculty);

// Route to delete a faculty (protected)
router.delete("/:id", authenticateJWT, deleteFaculty);

export default router;
