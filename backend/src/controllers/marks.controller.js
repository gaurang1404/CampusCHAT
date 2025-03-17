import { Marks } from "../models/marks.model.js"
import winston from "winston"

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "marks-logs.log" })],
})

// Bulk Add Marks
export const bulkAddMarks = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, examType, totalMarks, passingMarks, remarks, marksData } = req.body
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId || !examType) {
      const errorMessage = "Section ID, Course ID, Faculty ID, and Exam Type are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!Array.isArray(marksData) || marksData.length === 0) {
      const errorMessage = "Marks data must be a non-empty array"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Validate total marks and passing marks
    if (totalMarks <= 0) {
      const errorMessage = "Total marks must be greater than 0"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (passingMarks < 0 || passingMarks > totalMarks) {
      const errorMessage = "Passing marks must be between 0 and total marks"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Check if marks already exist for this section, course, faculty, and exam type
    const existingMarks = await Marks.findOne({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      examType,
    })

    if (existingMarks) {
      const errorMessage = "Marks have already been added for this section, course, faculty, and exam type"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Process bulk marks records
    const bulkOps = marksData.map(({ studentId, marksScored }) => {
      // Validate marks scored
      if (marksScored < 0 || marksScored > totalMarks) {
        throw new Error(`Marks scored for student ${studentId} must be between 0 and ${totalMarks}`)
      }

      return {
        insertOne: {
          document: {
            institutionDomain,
            sectionId,
            courseId,
            facultyId,
            studentId,
            totalMarks,
            passingMarks,
            marksScored,
            examType,
            remarks: remarks || "",
          },
        },
      }
    })

    // Perform bulk write operation
    const result = await Marks.bulkWrite(bulkOps)

    logger.info(`${new Date().toISOString()} - Success: Bulk marks processed successfully`)

    return res.status(200).json({
      message: "Bulk marks added successfully",
      data: {
        insertedCount: result.insertedCount,
      },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({ message: error.message || "Internal Server Error", data: [], code: 500 })
  }
}

// Bulk Update Marks
export const bulkUpdateMarks = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, examType, totalMarks, passingMarks, remarks, marksData } = req.body
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId || !examType) {
      const errorMessage = "Section ID, Course ID, Faculty ID, and Exam Type are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!Array.isArray(marksData) || marksData.length === 0) {
      const errorMessage = "Marks data must be a non-empty array"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Validate total marks and passing marks
    if (totalMarks <= 0) {
      const errorMessage = "Total marks must be greater than 0"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (passingMarks < 0 || passingMarks > totalMarks) {
      const errorMessage = "Passing marks must be between 0 and total marks"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Check if marks exist for this section, course, faculty, and exam type
    const existingMarks = await Marks.find({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      examType,
    })

    if (existingMarks.length === 0) {
      const errorMessage = "No marks found for this section, course, faculty, and exam type"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(404).json({ message: errorMessage, data: [], code: 404 })
    }

    // Process bulk update operations
    const bulkOps = marksData.map(({ studentId, marksScored }) => {
      // Validate marks scored
      if (marksScored < 0 || marksScored > totalMarks) {
        throw new Error(`Marks scored for student ${studentId} must be between 0 and ${totalMarks}`)
      }

      return {
        updateOne: {
          filter: {
            institutionDomain,
            sectionId,
            courseId,
            facultyId,
            studentId,
            examType,
          },
          update: {
            $set: {
              totalMarks,
              passingMarks,
              marksScored,
              remarks: remarks || "",
            },
          },
        },
      }
    })

    // Perform bulk write operation
    const result = await Marks.bulkWrite(bulkOps)

    logger.info(`${new Date().toISOString()} - Success: Bulk marks updated successfully`)

    return res.status(200).json({
      message: "Bulk marks updated successfully",
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
      code: 200,
    })
  } catch (error) {
    logger.error(`${new Date().toISOString()} - Error: ${error.message}`)
    return res.status(500).json({ message: error.message || "Internal Server Error", data: [], code: 500 })
  }
}

// Get Marks by Section, Course, Faculty, and Exam Type
export const getMarksBySectionCourseAndExamType = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, examType } = req.params
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId || !examType) {
      const errorMessage = "Section ID, Course ID, Faculty ID, and Exam Type are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    const marks = await Marks.find({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      examType,
    })
      .populate("studentId")
      .populate("courseId")
      .populate("facultyId")
      .sort({ "studentId.firstName": 1, "studentId.lastName": 1 })

    logger.info(`${new Date().toISOString()} - Success: Marks records retrieved`)

    return res.status(200).json({
      message: "Marks records retrieved successfully",
      data: { marks },
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

// Get Exam Types by Section, Course, and Faculty
export const getExamTypesBySection = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId } = req.params
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

    // Get distinct exam types for this section, course, and faculty
    const examTypes = await Marks.distinct("examType", {
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
    })

    logger.info(`${new Date().toISOString()} - Success: Exam types retrieved`)

    return res.status(200).json({
      message: "Exam types retrieved successfully",
      data: { examTypes },
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

// Delete Marks by Section, Course, Faculty, and Exam Type
export const deleteMarksByExamType = async (req, res) => {
  try {
    const { sectionId, courseId, facultyId, examType } = req.params
    const institutionDomain = req.institutionDomain

    if (!institutionDomain) {
      const errorMessage = "Institution domain is required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    if (!sectionId || !courseId || !facultyId || !examType) {
      const errorMessage = "Section ID, Course ID, Faculty ID, and Exam Type are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Delete all marks for this section, course, faculty, and exam type
    const result = await Marks.deleteMany({
      institutionDomain,
      sectionId,
      courseId,
      facultyId,
      examType,
    })

    if (result.deletedCount === 0) {
      const errorMessage = "No marks found for this section, course, faculty, and exam type"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(404).json({ message: errorMessage, data: [], code: 404 })
    }

    logger.info(`${new Date().toISOString()} - Success: Marks deleted successfully`)

    return res.status(200).json({
      message: "Marks deleted successfully",
      data: { deletedCount: result.deletedCount },
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

