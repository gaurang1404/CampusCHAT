import { Attendance } from "../models/attendance.model.js"
import { Semester } from "../models/semester.model.js";
import { Section } from "../models/section.model.js";

import winston from "winston"
import mongoose from "mongoose"

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "attendance-logs.log" })],
})

// Bulk Mark Attendance
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, attendanceData, date } = req.body
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId) {
      const errorMessage = "Section ID, Course ID, and Faculty ID are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      const errorMessage = "Attendance data must be a non-empty array"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Correct the date issue
    const attendanceDate = date ? new Date(date) : new Date()
    const formattedDate = new Date(attendanceDate.toISOString().split("T")[0]) // Ensure UTC date

    const startDate = new Date(formattedDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)

    const existingAttendance = await Attendance.findOne({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      date: { $gte: startDate, $lte: endDate }, // Fix incorrect date comparison
    })

    if (existingAttendance) {
      const errorMessage = "Attendance has already been marked for this section, course, and faculty today"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Process bulk attendance records
    const bulkOps = attendanceData.map(({ studentId, status, date: recordDate }) => {
      const recordFormattedDate = new Date(
        (recordDate ? new Date(recordDate) : formattedDate).toISOString().split("T")[0]
      ) // Convert to correct date format

      return {
        updateOne: {
          filter: {
            institutionDomain,
            sectionId,
            courseId,
            facultyId,
            studentId,
            date: recordFormattedDate, // Store the correct date
          },
          update: { $set: { status } },
          upsert: true, // Insert if not exists
        },
      }
    })

    // Perform bulk write operation
    const result = await Attendance.bulkWrite(bulkOps)

    logger.info(`${new Date().toISOString()} - Success: Bulk attendance processed successfully`)

    return res.status(200).json({
      message: "Bulk attendance marked successfully",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 })
  }
}


export const isAttendanceMarked = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId } = req.params;
    const institutionDomain = req.institutionDomain;
    
    if (!institutionDomain) {
      const errorMessage = "Institution domain is required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    if (!sectionId || !courseId || !facultyId) {
      const errorMessage = "Section ID, Course ID, and Faculty ID are required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }
    
    // First, retrieve the section to get the semester ID
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found", data: [], code: 404 });
    }
    
    // Get the semester to retrieve start and end dates
    const semester = await Semester.findById(section.semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found", data: [], code: 404 });
    }
    
    // Parse the semester date range
    let startDate, endDate;
    
    if (semester.startDate) {
      startDate = new Date(semester.startDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default to very old date if not set
      startDate = new Date("2000-01-01");
    }
    
    if (semester.endDate) {
      endDate = new Date(semester.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to far future date if not set
      endDate = new Date("2099-12-31");
    }

    // Find all attendance records for this section/course/faculty within the semester date range
    const markedDates = await Attendance.find({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      date: { $gte: startDate, $lte: endDate },
    }).select("date");

    const formattedDates = markedDates.map((entry) => entry.date.toISOString().split("T")[0]);
    
    return res.status(200).json({
      message: "Attendance marked dates retrieved successfully",
      data: formattedDates,
      code: 200,
    });
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 });
  }
};


export const getAttendanceBySectionAndDate = async (req, res) => {
  try {
    const { sectionId, date, courseId, facultyId } = req.params
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !date) {
      const errorMessage = "Section ID and date are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)

    // Build the query object
    const query = {
      institutionDomain,
      sectionId,
      date: { $gte: startDate, $lt: endDate },
    }

    // Add courseId and facultyId to the query if provided
    if (courseId) query.courseId = courseId
    if (facultyId) query.facultyId = facultyId

    const attendance = await Attendance.find(query)
      .populate("studentId")
      .populate("courseId")
      .populate("facultyId")

    logger.info(`${new Date().toISOString()} - Success: Attendance records retrieved`)

    return res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: { attendance },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

export const bulkUpdateAttendance = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, attendanceData, date } = req.body
    const institutionDomain = req.institutionDomain

    console.log("Request body:", req.body)

    if (!institutionDomain) {
      return res.status(400).json({ message: "Institution domain is required", data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId) {
      return res.status(400).json({
        message: "Section ID, Course ID, and Faculty ID are required",
        data: [],
        code: 400,
      })
    }

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ message: "Attendance updates must be a non-empty array", data: [], code: 400 })
    }

    // Normalize date to prevent timezone issues
    const attendanceDate = date ? new Date(date) : new Date()
    attendanceDate.setUTCHours(0, 0, 0, 0)

    console.log("Processed attendance date (UTC):", attendanceDate)

    // Prepare bulk operations for updating attendance
    const bulkOps = attendanceData.map(({ studentId, status }) => ({
      updateOne: {
        filter: {
          institutionDomain,
          sectionId,
          courseId,
          facultyId,
          studentId,
          date: attendanceDate,
        },
        update: { $set: { status } },
        upsert: true, // Ensure attendance is created if not found
      },
    }))

    console.log("Bulk update operations:", bulkOps)

    // Execute bulk update operation
    const result = await Attendance.bulkWrite(bulkOps)

    console.log("Update result:", result)

    return res.status(200).json({
      message: "Bulk attendance updated successfully",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
      code: 200,
    })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 })
  }
}


export const checkAttendanceExists = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, date } = req.params
    const institutionDomain = req.institutionDomain

    if (!institutionDomain || !sectionId || !courseId || !facultyId || !date) {
      const errorMessage = "Missing required parameters"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)

    // Check if any attendance records exist for this combination
    const existingAttendance = await Attendance.findOne({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      date: { $gte: startDate, $lt: endDate },
    })

    return res.status(200).json({
      message: "Attendance check completed",
      data: { exists: !!existingAttendance },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

// Add a function to get attendance history for a section, course, faculty combination
export const getAttendanceHistory = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId } = req.params
    const institutionDomain = req.institutionDomain

    if (!institutionDomain || !sectionId || !courseId || !facultyId) {
      const errorMessage = "Missing required parameters"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Get all dates where attendance was marked for this combination
    const attendanceDates = await Attendance.aggregate([
      {
        $match: {
          institutionDomain,
          sectionId: new mongoose.Types.ObjectId(sectionId),
          courseId: new mongoose.Types.ObjectId(courseId),
          facultyId: new mongoose.Types.ObjectId(facultyId),
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
          absentCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Absent"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date descending (newest first)
      },
    ])

    return res.status(200).json({
      message: "Attendance history retrieved successfully",
      data: { attendanceDates },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}
