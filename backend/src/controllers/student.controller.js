import { Student } from "../models/student.model.js"
import { Department } from "../models/department.model.js"
import { Admin } from "../models/admin.model.js"
import { Section } from "../models/section.model.js"
import { Semester } from "../models/semester.model.js"
import { Attendance } from "../models/attendance.model.js"
import { Marks } from "../models/marks.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import winston from "winston"
import mongoose from "mongoose"

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "student-logs.log" })],
})

// Add Student
export const addStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      collegeEmail,
      password,
      studentId,
      institutionDomain,
      sectionId,
      semesterId,
      departmentId,
    } = req.body

    if (
      !firstName ||
      !lastName ||
      !collegeEmail ||
      !password ||
      !studentId ||
      !institutionDomain ||
      !sectionId ||
      !semesterId ||
      !departmentId
    ) {
      const errorMessage = "All fields are required"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({
        message: errorMessage,
        data: [],
        code: 400,
      })
    }

    // Password length validation
    if (password.length < 8) {
      const errorMessage = "Password should be at least 8 characters"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({
        message: errorMessage,
        data: [],
        code: 400,
      })
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(collegeEmail)) {
      const errorMessage = "Please provide a valid email address"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({
        message: errorMessage,
        data: [],
        code: 400,
      })
    }

    // Validate Admin
    const admin = await Admin.findById(req.userId)
    if (!admin) {
      logger.error(`Admin not found for adminId: ${req.userId}`)
      return res.status(404).json({
        message: "Admin not found",
        data: [],
        code: 404,
      })
    }

    // Check Institution Domain
    if (admin.institutionDomain !== institutionDomain) {
      logger.warn(`Admin domain mismatch. Expected: ${admin.institutionDomain}, Received: ${institutionDomain}`)
      return res.status(400).json({
        message: "Student must belong to the same institution as the admin",
        data: [],
        code: 400,
      })
    }

    // Check if the email matches the institution domain
    if (!collegeEmail.endsWith(`@${admin.institutionDomain}`)) {
      const errorMessage = "Email must belong to the institution domain"
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`)
      return res.status(400).json({
        message: errorMessage,
        data: [],
        code: 400,
      })
    }

    // Validate Department
    const departmentExists = await Department.findById(departmentId)
    if (!departmentExists) {
      return res.status(404).json({
        message: "Department not found",
        data: [],
        code: 404,
      })
    }

    // Validate Semester
    const semesterExists = await Semester.findById(semesterId)
    if (!semesterExists) {
      return res.status(404).json({
        message: "Semester not found",
        data: [],
        code: 404,
      })
    }

    // Validate Section
    const sectionExists = await Section.findById(sectionId)
    if (!sectionExists) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Check if student with the same email or student ID exists
    const existingStudent = await Student.findOne({
      $or: [{ collegeEmail }, { studentId }],
    })
    if (existingStudent) {
      logger.warn(`Student already exists with email ${collegeEmail} or student ID ${studentId}`)
      return res.status(400).json({
        message: "Student with this email or student ID already exists",
        data: [],
        code: 400,
      })
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new Student
    const newStudent = new Student({
      firstName,
      lastName,
      collegeEmail,
      password: hashedPassword,
      studentId,
      institutionDomain,
      sectionId,
      semesterId,
      departmentId,
    })

    // Save Student to DB
    await newStudent.save()

    // Add student to the section
    await Section.findByIdAndUpdate(sectionId, {
      $push: { students: newStudent._id },
    })

    logger.info(`New student added successfully: ${newStudent.firstName} ${newStudent.lastName}`)
    return res.status(201).json({
      message: "Student added successfully",
      data: { student: newStudent },
      code: 201,
    })
  } catch (error) {
    logger.error(`Error adding student: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
      const errorMessage = "Email and password are required"
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`)
      return res.status(400).json({ message: errorMessage, data: [], code: 400 })
    }

    // Find the student by email
    const student = await Student.findOne({ collegeEmail: email })
    if (!student) {
      const errorMessage = "Student not found"
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`)
      return res.status(404).json({ message: errorMessage, data: [], code: 404 })
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, student.password)
    if (!match) {
      const errorMessage = "Incorrect password"
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`)
      return res.status(401).json({ message: errorMessage, data: [], code: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: student._id, email: student.email, role: "Student", institutionDomain: student.institutionDomain },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }, // Token expires in 30 days
    )

    // Convert to plain object and set the role
    const studentData = student.toObject()
    studentData.role = "Student"

    logger.info(`${new Date().toISOString()} - Success: Student logged in successfully`)
    return res.status(200).json({
      message: "Login successful",
      data: [{ token }, { student: studentData }],
      code: 200,
    })
  } catch (error) {
    // Log error with timestamp
    logger.error(`${new Date().toISOString()} - Error: Error logging in - ${error.message}`)
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 })
  }
}

// Get All Students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({institutionDomain: req.institutionDomain}).populate("departmentId")
    return res.status(200).json({
      message: "Students fetched successfully",
      data: { students },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching students: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

// Get Student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("departmentId")
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }
    return res.status(200).json({
      message: "Student fetched successfully",
      data: { student },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching student by ID: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

// Update Student
export const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }
    return res.status(200).json({
      message: "Student updated successfully",
      data: { student: updatedStudent },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error updating student: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

// Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id)
    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }
    logger.info(`Student deleted successfully: ${deletedStudent.firstName} ${deletedStudent.lastName}`)
    return res.status(200).json({
      message: "Student deleted successfully",
      data: [],
      code: 200,
    })
  } catch (error) {
    logger.error(`Error deleting student: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

export const getStudentData = async (req, res) => {
  try {
    const studentId = req.params.id;    


    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      logger.warn(`Invalid student ID format: ${studentId}`);
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      });
    }

    // Find student with populated references
    const student = await Student.findById(studentId)
      .populate("departmentId")
      .populate("semesterId") // Directly populate semester
      .populate({
        path: "sectionId",
        populate: [
          { path: "courseFacultyMappings.courseId", model: "Course" },
          { path: "semesterId", model: "Semester" }, // Ensure section has semester populated
        ],
      });

    console.log(student); // Debugging

    if (!student) {
      logger.warn(`Student not found with ID: ${studentId}`);
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      });
    }

    logger.info(`Student data fetched successfully for ID: ${studentId}`);
    return res.status(200).json({
      message: "Student data fetched successfully",
      data: { student },
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching student data: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    });
  }
};

/**
 * Get student overview data
 */
export const getStudentOverview = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get attendance data
    const attendanceRecords = await Attendance.find({
      studentId: studentId,
      institutionDomain: student.institutionDomain,
    })

    const totalAttendance = attendanceRecords.length
    const presentCount = attendanceRecords.filter((record) => record.status === "Present").length
    const absentCount = totalAttendance - presentCount
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

    // Get marks data for grade distribution
    const marksRecords = await Marks.find({
      studentId: studentId,
      institutionDomain: student.institutionDomain,
    }).populate("courseId")

    // Calculate grade distribution
    const gradeMap = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    }

    marksRecords.forEach((record) => {
      const percentage = (record.marksScored / record.totalMarks) * 100
      if (percentage >= 90) gradeMap["A"]++
      else if (percentage >= 80) gradeMap["B"]++
      else if (percentage >= 70) gradeMap["C"]++
      else if (percentage >= 60) gradeMap["D"]++
      else gradeMap["F"]++
    })

    const gradeDistribution = Object.keys(gradeMap).map((name) => ({
      name,
      count: gradeMap[name],
    }))

    // Prepare response data
    const overviewData = {
      attendance: {
        present: presentCount,
        absent: absentCount,
        total: totalAttendance,
        percentage: attendancePercentage,
      },
      gradeDistribution,
    }

    logger.info(`Overview data fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Overview data fetched successfully",
      data: overviewData,
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching student overview: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get student course progress
 */
export const getStudentCourseProgress = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get section and courses
    const section = await Section.findById(student.sectionId).populate({
      path: "courseFacultyMappings.courseId",
      model: "Course",
    })

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Calculate course progress based on completed assessments
    const courseProgress = []

    for (const mapping of section.courseFacultyMappings) {
      const course = mapping.courseId

      // Get all marks for this course
      const marksRecords = await Marks.find({
        studentId: studentId,
        courseId: course._id,
        institutionDomain: student.institutionDomain,
      })

      // Calculate completion percentage based on assessments completed
      const totalAssessments = 6 // Assuming 6 assessments per course (quizzes, midterms, finals, etc.)
      const completedAssessments = marksRecords.length
      const completionPercentage = Math.round((completedAssessments / totalAssessments) * 100)

      courseProgress.push({
        name: course.name,
        completed: completionPercentage,
      })
    }

    logger.info(`Course progress fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Course progress fetched successfully",
      data: { courses: courseProgress },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching student course progress: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get student attendance data
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find({
      studentId: studentId,
      institutionDomain: student.institutionDomain,
    })
      .populate("courseId")
      .sort({ date: 1 })

    const totalAttendance = attendanceRecords.length
    const presentCount = attendanceRecords.filter((record) => record.status === "Present").length
    const absentCount = totalAttendance - presentCount
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

    // Format daily attendance
    const dailyAttendance = attendanceRecords.map((record) => ({
      date: record.date,
      status: record.status,
      course: record.courseId ? record.courseId.name : "Unknown Course",
    }))

    // Prepare response data
    const attendanceData = {
      overall: {
        present: presentCount,
        absent: absentCount,
        total: totalAttendance,
        percentage: attendancePercentage,
      },
      daily: dailyAttendance,
    }

    logger.info(`Attendance data fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Attendance data fetched successfully",
      data: attendanceData,
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching student attendance: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get student attendance by date
 */
export const getStudentAttendanceByDate = async (req, res) => {
  try {
    const { id, date } = req.params;

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
        data: [],
        code: 400,
      });
    }

    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      });
    }

    // Get attendance for the specific date
    const attendanceRecords = await Attendance.find({
      studentId: id,
      date: new Date(date),
      institutionDomain: student.institutionDomain,
    }).populate("courseId");

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        message: "No attendance record found for this date",
        data: [],
        code: 404,
      });
    }

    // Format attendance data as an array of objects
    const attendanceData = attendanceRecords.map((record) => ({
      date: record.date,
      status: record.status,
      course: record.courseId ? record.courseId.name : "Unknown Course",
    }));

    logger.info(`Attendance for date ${date} fetched successfully for student ID: ${id}`);
    return res.status(200).json({
      message: "Attendance data fetched successfully",
      data: { attendance: attendanceData },
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching student attendance by date: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    });
  }
};

/**
 * Get course-wise attendance
 */
export const getCourseWiseAttendance = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get section and courses
    const section = await Section.findById(student.sectionId).populate({
      path: "courseFacultyMappings.courseId",
      model: "Course",
    })

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Calculate course-wise attendance
    const courseWiseAttendance = []

    for (const mapping of section.courseFacultyMappings) {
      const course = mapping.courseId

      // Get attendance records for this course
      const attendanceRecords = await Attendance.find({
        studentId: studentId,
        courseId: course._id,
        institutionDomain: student.institutionDomain,
      })

      const totalAttendance = attendanceRecords.length
      const presentCount = attendanceRecords.filter((record) => record.status === "Present").length
      const absentCount = totalAttendance - presentCount
      const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

      courseWiseAttendance.push({
        name: course.name,
        present: presentCount,
        absent: absentCount,
        total: totalAttendance,
        percentage: attendancePercentage,
      })
    }

    logger.info(`Course-wise attendance fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Course-wise attendance fetched successfully",
      data: { courses: courseWiseAttendance },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching course-wise attendance: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get monthly attendance
 */
export const getMonthlyAttendance = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find({
      studentId: studentId,
      institutionDomain: student.institutionDomain,
    }).sort({ date: 1 })

    // Group by month
    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date)
      const month = months[date.getMonth()]

      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, absent: 0 }
      }

      if (record.status === "Present") {
        monthlyData[month].present++
      } else {
        monthlyData[month].absent++
      }
    })

    // Format monthly data
    const monthlyAttendance = Object.keys(monthlyData).map((month) => ({
      month,
      present: monthlyData[month].present,
      absent: monthlyData[month].absent,
    }))

    logger.info(`Monthly attendance fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Monthly attendance fetched successfully",
      data: { months: monthlyAttendance },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching monthly attendance: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get student marks data
 */
export const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get section and courses
    const section = await Section.findById(student.sectionId).populate({
      path: "courseFacultyMappings.courseId",
      model: "Course",
    })

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Calculate overall marks data
    const totalCredits = section.courseFacultyMappings.reduce(
      (sum, mapping) => sum + (mapping.courseId.credits || 0),
      0,
    )

    // Calculate GPA and average
    let totalWeightedGradePoints = 0
    let totalPercentage = 0
    let courseCount = 0

    for (const mapping of section.courseFacultyMappings) {
      const course = mapping.courseId

      // Get marks for this course
      const marksRecords = await Marks.find({
        studentId: studentId,
        courseId: course._id,
        institutionDomain: student.institutionDomain,
      })

      if (marksRecords.length > 0) {
        // Calculate average percentage for this course
        const totalPercentageForCourse = marksRecords.reduce((sum, record) => {
          return sum + (record.marksScored / record.totalMarks) * 100
        }, 0)

        const averagePercentage = totalPercentageForCourse / marksRecords.length
        totalPercentage += averagePercentage

        // Calculate grade points
        let gradePoints = 0
        if (averagePercentage >= 90) gradePoints = 4.0
        else if (averagePercentage >= 85) gradePoints = 3.7
        else if (averagePercentage >= 80) gradePoints = 3.3
        else if (averagePercentage >= 75) gradePoints = 3.0
        else if (averagePercentage >= 70) gradePoints = 2.7
        else if (averagePercentage >= 65) gradePoints = 2.3
        else if (averagePercentage >= 60) gradePoints = 2.0
        else if (averagePercentage >= 55) gradePoints = 1.7
        else if (averagePercentage >= 50) gradePoints = 1.3
        else gradePoints = 0.0

        totalWeightedGradePoints += gradePoints * (course.credits || 4)
        courseCount++
      }
    }

    const currentSemesterAverage = courseCount > 0 ? totalPercentage / courseCount : 0

    // Prepare response data
    const marksData = {
      overall: {
        totalCredits,
        currentSemesterAverage: Number.parseFloat(currentSemesterAverage.toFixed(2)),
      },
    }

    logger.info(`Marks data fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Marks data fetched successfully",
      data: marksData,
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching student marks: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get course marks
 */
export const getCourseMarks = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get section and courses
    const section = await Section.findById(student.sectionId).populate({
      path: "courseFacultyMappings.courseId",
      model: "Course",
    })

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Get course marks
    const courseMarks = []

    for (const mapping of section.courseFacultyMappings) {
      const course = mapping.courseId

      // Get marks for this course
      const marksRecords = await Marks.find({
        studentId: studentId,
        courseId: course._id,
        institutionDomain: student.institutionDomain,
      })

      // Get unique exam types for this course
      const examTypes = [...new Set(marksRecords.map((record) => record.examType))]

      // Create assessments array from actual exam types
      const assessments = examTypes.map((examType) => {
        const record = marksRecords.find((r) => r.examType === examType)

        // Format the exam type name for display
        const formattedName = examType.replace(/-/g, " ")

        return {
          name: formattedName,
          maxMarks: record.totalMarks,
          weightage: calculateWeightage(examType),
          marksScored: record.marksScored,
        }
      })

      // Calculate total percentage correctly
      let totalMarksObtained = assessments.reduce((sum, assessment) => sum + assessment.marksScored, 0);
      let totalMaxMarks = assessments.reduce((sum, assessment) => sum + assessment.maxMarks, 0);

      // Avoid division by zero
      const normalizedPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;


      // Determine grade and grade points
      let grade, gradePoints
      if (normalizedPercentage >= 90) {
        grade = "O"
        gradePoints = 4.0
      } else if (normalizedPercentage >= 80) {
        grade = "A+"
        gradePoints = 3.7
      } else if (normalizedPercentage >= 70) {
        grade = "A"
        gradePoints = 3.3
      } else if (normalizedPercentage >= 60) {
        grade = "B+"
        gradePoints = 3.0
      } else if (normalizedPercentage >= 50) {
        grade = "B"
        gradePoints = 2.7
      } else if (normalizedPercentage >= 40) {
        grade = "C+"
        gradePoints = 2.3
      } else if (normalizedPercentage >= 30) {
        grade = "C"
        gradePoints = 2.0
      } else if (normalizedPercentage >= 20) {
        grade = "D+"
        gradePoints = 1.7
      } else if (normalizedPercentage >= 10) {
        grade = "D"
        gradePoints = 1.0
      } else {
        grade = "F"
        gradePoints = 0.0
      }

      courseMarks.push({
        id: course._id.toString(),
        name: course.name,
        code: course.courseCode,
        credits: course.credits || 0,
        assessments,
        totalWeightedPercentage: normalizedPercentage,
        grade,
        gradePoints,
      })
    }

    logger.info(`Course marks fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Course marks fetched successfully",
      data: { courses: courseMarks },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching course marks: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get semester progress
 */
export const getSemesterProgress = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get marks grouped by exam type
    const marksRecords = await Marks.find({
      studentId: studentId,
      institutionDomain: student.institutionDomain,
    })

    // Define standard assessment sequence
    const assessmentSequence = ["Quiz 1", "Assignment 1", "Midterm", "Assignment 2", "Quiz 2", "Final"]

    // Calculate average for each assessment type
    const progressData = {}

    marksRecords.forEach((record) => {
      let assessmentType = ""

      // Map exam type to standard assessment
      for (const assessment of assessmentSequence) {
        if (record.examType.includes(assessment.replace(" ", "-"))) {
          assessmentType = assessment
          break
        }
      }

      if (!assessmentType) return // Skip if no matching assessment type

      if (!progressData[assessmentType]) {
        progressData[assessmentType] = {
          total: 0,
          count: 0,
        }
      }

      const percentage = (record.marksScored / record.totalMarks) * 100
      progressData[assessmentType].total += percentage
      progressData[assessmentType].count++
    })

    // Format progress data - only include assessments with actual data
    const semesterProgress = assessmentSequence
      .filter((name) => {
        const data = progressData[name] || { total: 0, count: 0 }
        return data.count > 0 // Only include assessments with actual data
      })
      .map((name) => {
        const data = progressData[name] || { total: 0, count: 0 }
        const average = data.count > 0 ? Math.round(data.total / data.count) : null

        return {
          name,
          average,
        }
      })

    logger.info(`Semester progress fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Semester progress fetched successfully",
      data: { progress: semesterProgress },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching semester progress: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

/**
 * Get comparison data for student vs section average
 */
export const getComparisonData = async (req, res) => {
  try {
    const studentId = req.params.id
    const { sectionId, semesterId } = req.query

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID format",
        data: [],
        code: 400,
      })
    }

    // Find student
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        data: [],
        code: 404,
      })
    }

    // Get section and courses
    const section = await Section.findById(sectionId || student.sectionId).populate({
      path: "courseFacultyMappings.courseId",
      model: "Course",
    })

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
        data: [],
        code: 404,
      })
    }

    // Get all students in the section
    const studentsInSection = await Student.find({
      sectionId: section._id,
      semesterId: semesterId || student.semesterId,
    })

    // Prepare comparison data
    const comparisonData = []

    for (const mapping of section.courseFacultyMappings) {
      const course = mapping.courseId

      // Get student's marks for this course
      const studentMarks = await Marks.find({
        studentId: studentId,
        courseId: course._id,
        institutionDomain: student.institutionDomain,
      })

      if (studentMarks.length === 0) continue

      // Calculate student's average percentage
      const studentTotalPercentage = studentMarks.reduce((sum, record) => {
        return sum + (record.marksScored / record.totalMarks) * 100
      }, 0)
      const studentAverage = studentTotalPercentage / studentMarks.length

      // Calculate section average for this course
      let sectionTotalPercentage = 0
      let sectionStudentCount = 0

      for (const sectionStudent of studentsInSection) {
        if (sectionStudent._id.toString() === studentId) continue // Skip the current student

        const sectionStudentMarks = await Marks.find({
          studentId: sectionStudent._id,
          courseId: course._id,
          institutionDomain: student.institutionDomain,
        })

        if (sectionStudentMarks.length > 0) {
          const studentPercentage =
            sectionStudentMarks.reduce((sum, record) => {
              return sum + (record.marksScored / record.totalMarks) * 100
            }, 0) / sectionStudentMarks.length

          sectionTotalPercentage += studentPercentage
          sectionStudentCount++
        }
      }

      const sectionAverage = sectionStudentCount > 0 ? sectionTotalPercentage / sectionStudentCount : 0

      // Get trend data for the first course
      const trendData = []
      if (comparisonData.length === 0 && studentMarks.length > 0) {
        // Group marks by exam type
        const examTypes = [...new Set(studentMarks.map((mark) => mark.examType))]

        for (const examType of examTypes) {
          const studentExamMark = studentMarks.find((mark) => mark.examType === examType)

          // Calculate section average for this exam
          let sectionExamTotal = 0
          let sectionExamCount = 0

          for (const sectionStudent of studentsInSection) {
            if (sectionStudent._id.toString() === studentId) continue

            const sectionStudentExamMark = await Marks.findOne({
              studentId: sectionStudent._id,
              courseId: course._id,
              examType: examType,
              institutionDomain: student.institutionDomain,
            })

            if (sectionStudentExamMark) {
              sectionExamTotal += (sectionStudentExamMark.marksScored / sectionStudentExamMark.totalMarks) * 100
              sectionExamCount++
            }
          }

          const sectionExamAverage = sectionExamCount > 0 ? sectionExamTotal / sectionExamCount : 0

          trendData.push({
            examName: examType.replace(/-/g, " "),
            yourScore: studentExamMark ? (studentExamMark.marksScored / studentExamMark.totalMarks) * 100 : 0,
            sectionAverage: sectionExamAverage,
          })
        }
      }

      comparisonData.push({
        courseId: course._id.toString(),
        courseName: course.name,
        courseCode: course.courseCode,
        yourScore: Math.round(studentAverage),
        sectionAverage: Math.round(sectionAverage),
        trendData: trendData,
      })
    }

    logger.info(`Comparison data fetched successfully for student ID: ${studentId}`)
    return res.status(200).json({
      message: "Comparison data fetched successfully",
      data: { comparison: comparisonData },
      code: 200,
    })
  } catch (error) {
    logger.error(`Error fetching comparison data: ${error.message}`)
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    })
  }
}

function calculateWeightage(examType) {
  if (examType.includes("Final")) {
    return 30
  } else if (examType.includes("Midterm")) {
    return 25
  } else if (examType.includes("Quiz")) {
    return 15
  } else if (examType.includes("Assignment")) {
    return 15
  } else if (examType.includes("Lab")) {
    return 15
  } else if (examType.includes("Attendance")) {
    return 10
  } else {
    return 10 // Default weightage
  }
}

