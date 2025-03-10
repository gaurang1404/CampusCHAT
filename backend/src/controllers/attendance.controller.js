import { Attendance } from "../models/Attendance.js";
import winston from "winston";

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "attendance-logs.log" }),
  ],
});

// Bulk Mark Attendance
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, attendanceData } = req.body;
    const institutionDomain = req.institutionDomain;

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      const errorMessage = "Attendance data must be a non-empty array";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Process bulk attendance records
    const bulkOps = attendanceData.map(({ studentId, status, date }) => ({
      updateOne: {
        filter: {
          institutionDomain,
          sectionId,
          studentId,
          date: new Date(date).setHours(0, 0, 0, 0),
        },
        update: {
          $set: { status, courseId, facultyId },
        },
        upsert: true, // Insert if not exists
      },
    }));

    // Perform bulk write operation
    const result = await Attendance.bulkWrite(bulkOps);

    logger.info(`${new Date().toISOString()} - Success: Bulk attendance processed successfully`);

    return res.status(200).json({
      message: "Bulk attendance marked successfully",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
      code: 200,
    });

  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 });
  }
};

export const bulkUpdateAttendance = async (req, res) => {
    try {
      const { sectionId, attendanceUpdates } = req.body;
      const institutionDomain = req.institutionDomain;
  
      if (!institutionDomain) {
        return res.status(400).json({ message: "Institution domain is required", data: [], code: 400 });
      }
  
      if (!Array.isArray(attendanceUpdates) || attendanceUpdates.length === 0) {
        return res.status(400).json({ message: "Attendance updates must be a non-empty array", data: [], code: 400 });
      }
  
      // Process bulk update operations
      const bulkOps = attendanceUpdates.map(({ studentId, status, date }) => ({
        updateOne: {
          filter: {
            institutionDomain,
            sectionId,
            studentId,
            date: new Date(date).setHours(0, 0, 0, 0),
          },
          update: { $set: { status } },
        },
      }));
  
      // Execute bulk update
      const result = await Attendance.bulkWrite(bulkOps);
  
      logger.info(`${new Date().toISOString()} - Success: Bulk attendance updated successfully`);
  
      return res.status(200).json({
        message: "Bulk attendance updated successfully",
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
        code: 200,
      });
  
    } catch (error) {
      logger.error(`${new Date().toISOString()} - Error: ${error.message}`);
      return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 });
    }
  };
  