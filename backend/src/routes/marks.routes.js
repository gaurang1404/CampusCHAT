import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { bulkAddMarks, bulkUpdateMarks, deleteMarksByExamType, getExamTypesBySection, getMarksBySectionCourseAndExamType } from '../controllers/marks.controller.js';

const router = express.Router();

router.get("/exam-types/:sectionId/course/:courseId/faculty/:facultyId", authenticateJWT, getExamTypesBySection);

router.get("/section/:sectionId/course/:courseId/faculty/:facultyId/exam-type/:examType", authenticateJWT, getMarksBySectionCourseAndExamType);

router.post("/bulk-add", authenticateJWT, bulkAddMarks);

router.put("/bulk-update", authenticateJWT, bulkUpdateMarks);

router.delete("/section/:sectionId/course/:courseId/faculty/:facultyId/exam-type/:examType", authenticateJWT, deleteMarksByExamType);

export default router;
