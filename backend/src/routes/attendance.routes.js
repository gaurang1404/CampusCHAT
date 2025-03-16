import express from 'express';
import { bulkMarkAttendance, bulkUpdateAttendance, checkAttendanceExists, getAttendanceBySectionAndDate, getAttendanceHistory, isAttendanceMarked } from '../controllers/attendance.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply rate limit to registration route
router.get("/section/:sectionId/course/:courseId/faculty/:facultyId/date/:date", authenticateJWT, getAttendanceBySectionAndDate);

router.get("/check/:sectionId/course/:courseId/faculty/:facultyId/date/:date", authenticateJWT, checkAttendanceExists);

router.post("/bulk-mark", authenticateJWT, bulkMarkAttendance);

router.post("/bulk-update", authenticateJWT, bulkUpdateAttendance);

router.get("/history/:sectionId/course/:courseId/faculty/:facultyId", authenticateJWT, getAttendanceHistory);

router.get("/is-marked/:sectionId/section/:courseId/course/:facultyId/faculty", authenticateJWT, isAttendanceMarked);
// // Bulk mark attendance
// router.post("/bulk-mark", bulkMarkAttendance)

// // Bulk update attendance
// router.post("/bulk-update", bulkUpdateAttendance)

export default router;
