import express from 'express';
import { 
  addSection, 
  getSections, 
  getSectionById, 
  updateSection, 
  deleteSection, 
  addCourseFacultyMapping,
  deleteCourseFacultyMapping,
  getStudentsInSection
} from '../controllers/section.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rate.middleware.js';

const router = express.Router();

// Apply rate limiting and authentication to section creation
router.post("/add", authenticateJWT, rateLimiter, addSection);

// Route to add course faculty mapping (protected)
router.post("/mapping", authenticateJWT, addCourseFacultyMapping);

// Route to add course faculty mapping (protected)
router.delete("/mapping", authenticateJWT, deleteCourseFacultyMapping);

// Route to get all sections (protected)
router.get("/", authenticateJWT, getSections);

// Route to get a single section by ID (protected)
router.get("/:id/students", authenticateJWT, getStudentsInSection);

router.get("/:id", authenticateJWT, getSectionById);
// Route to get a single section by ID (protected)

// Route to update section details (protected)
router.put("/:id", authenticateJWT, updateSection);

// Route to delete a section (protected)
router.delete("/:id", authenticateJWT, deleteSection);

export default router;
