import express from 'express';
import { 
  addSemester, 
  getSemesters, 
  getSemesterById, 
  updateSemester, 
  deleteSemester 
} from '../controllers/semester.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rate.middleware.js';

const router = express.Router();

// Apply rate limiting and authentication to semester creation
router.post("/add", authenticateJWT, rateLimiter, addSemester);

// Route to get all semesters (protected)
router.get("/", authenticateJWT, getSemesters);

// Route to get a single semester by ID (protected)
router.get("/:id", authenticateJWT, getSemesterById);

// Route to update semester details (protected)
router.put("/:id", authenticateJWT, updateSemester);

// Route to delete a semester (protected)
router.delete("/:id", authenticateJWT, deleteSemester);

export default router;
