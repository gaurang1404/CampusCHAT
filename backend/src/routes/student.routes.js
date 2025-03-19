import express from "express";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  loginStudent,
  getStudentData,
  getStudentOverview,
  getStudentCourseProgress,
  getStudentAttendance,
  getStudentAttendanceByDate,
  getCourseWiseAttendance,
  getMonthlyAttendance,
  getStudentMarks,
  getCourseMarks,
  getSemesterProgress,
  getComparisonData,
} from "../controllers/student.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate.middleware.js";

const router = express.Router();

// Apply rate limit to student creation route
router.post("/add", authenticateJWT, rateLimiter, addStudent);

router.post("/login", loginStudent);

// Route to get all students (protected)
router.get("/", authenticateJWT, getStudents);

// Route to get a single student by ID (protected)
router.get("/:id", authenticateJWT, getStudentById);

// Route to update student details (protected)
router.put("/:id", authenticateJWT, updateStudent);

// Route to delete a student (protected)
router.delete("/:id", authenticateJWT, deleteStudent);


router.get("/get/:id", getStudentData)

// Overview tab
router.get("/:id/overview", getStudentOverview)
router.get("/:id/course-progress", getStudentCourseProgress)

// Attendance tab
router.get("/:id/attendance", getStudentAttendance)
router.get("/:id/attendance/date/:date", getStudentAttendanceByDate)
router.get("/:id/attendance/course-wise", getCourseWiseAttendance)
router.get("/:id/attendance/monthly", getMonthlyAttendance)

// Marks tab
router.get("/:id/marks", getStudentMarks)
router.get("/:id/marks/courses", getCourseMarks)
router.get("/:id/marks/progress", getSemesterProgress)
router.get("/:id/comparison", getComparisonData) 

export default router;