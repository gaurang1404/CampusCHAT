import { Student } from "../models/student.model.js";
import { Department } from "../models/department.model.js";
import { Admin } from "../models/admin.model.js";
import { Section } from "../models/section.model.js";
import { Semester } from "../models/semester.model.js";
import bcrypt from "bcrypt";
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
        new winston.transports.File({ filename: "student-logs.log" }),
    ],
});

// Add Student
export const addStudent = async (req, res) => {
    try {
        const { firstName, lastName, collegeEmail, password, studentId, institutionDomain, sectionId, semesterId, departmentId } = req.body;

        if (!firstName || !lastName || !collegeEmail || !password || !studentId || !institutionDomain || !sectionId || !semesterId || !departmentId) {
            const errorMessage = "All fields are required";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ 
                message: errorMessage, 
                data: [], 
                code: 400 
            });
        }

        // Password length validation
        if (password.length < 8) {
            const errorMessage = "Password should be at least 8 characters";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ 
                message: errorMessage, 
                data: [], 
                code: 400 
            });
        }

        // Email format validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(collegeEmail)) {
            const errorMessage = "Please provide a valid email address";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ 
                message: errorMessage, 
                data: [], 
                code: 400 
            });
        }

        // Validate Admin
        const admin = await Admin.findById(req.userId);
        if (!admin) {
            logger.error(`Admin not found for adminId: ${req.userId}`);
            return res.status(404).json({ 
                message: "Admin not found", 
                data: [], 
                code: 404 
            });
        }

        // Check Institution Domain
        if (admin.institutionDomain !== institutionDomain) {
            logger.warn(`Admin domain mismatch. Expected: ${admin.institutionDomain}, Received: ${institutionDomain}`);
            return res.status(400).json({ 
                message: "Student must belong to the same institution as the admin", 
                data: [], 
                code: 400 
            });
        }

        // Check if the email matches the institution domain
        if (!collegeEmail.endsWith(`@${admin.institutionDomain}`)) {
            const errorMessage = "Email must belong to the institution domain";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ 
                message: errorMessage, 
                data: [], 
                code: 400 
            });
        }

        // Validate Department
        const departmentExists = await Department.findById(departmentId);
        if (!departmentExists) {
            return res.status(404).json({ 
                message: "Department not found", 
                data: [], 
                code: 404 
            });
        }

        // Validate Semester
        const semesterExists = await Semester.findById(semesterId);
        if (!semesterExists) {
            return res.status(404).json({ 
                message: "Semester not found", 
                data: [], 
                code: 404 
            });
        }

        // Validate Section
        const sectionExists = await Section.findById(sectionId);
        if (!sectionExists) {
            return res.status(404).json({ 
                message: "Section not found", 
                data: [], 
                code: 404 
            });
        }

        // Check if student with the same email or student ID exists
        const existingStudent = await Student.findOne({
            $or: [{ collegeEmail }, { studentId }]
        });
        if (existingStudent) {
            logger.warn(`Student already exists with email ${collegeEmail} or student ID ${studentId}`);
            return res.status(400).json({ 
                message: "Student with this email or student ID already exists", 
                data: [], 
                code: 400 
            });
        }

        // Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);

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
        });

        // Save Student to DB
        await newStudent.save();

        logger.info(`New student added successfully: ${newStudent.firstName} ${newStudent.lastName}`);
        return res.status(201).json({ 
            message: "Student added successfully", 
            data: { student: newStudent }, 
            code: 201 
        });
    } catch (error) {
        logger.error(`Error adding student: ${error.message}`);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            data: [], 
            code: 500 
        });
    }
};

// Get All Students
export const getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate("departmentId");
        return res.status(200).json({ 
            message: "Students fetched successfully", 
            data: { students }, 
            code: 200 
        });
    } catch (error) {
        logger.error(`Error fetching students: ${error.message}`);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            data: [], 
            code: 500 
        });
    }
};

// Get Student by ID
export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("departmentId");
        if (!student) {
            return res.status(404).json({ 
                message: "Student not found", 
                data: [], 
                code: 404 
            });
        }
        return res.status(200).json({ 
            message: "Student fetched successfully", 
            data: { student }, 
            code: 200 
        });
    } catch (error) {
        logger.error(`Error fetching student by ID: ${error.message}`);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            data: [], 
            code: 500 
        });
    }
};

// Update Student
export const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ 
                message: "Student not found", 
                data: [], 
                code: 404 
            });
        }
        return res.status(200).json({ 
            message: "Student updated successfully", 
            data: { student: updatedStudent }, 
            code: 200 
        });
    } catch (error) {
        logger.error(`Error updating student: ${error.message}`);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            data: [], 
            code: 500 
        });
    }
};

// Delete Student
export const deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ 
                message: "Student not found", 
                data: [], 
                code: 404 
            });
        }
        logger.info(`Student deleted successfully: ${deletedStudent.firstName} ${deletedStudent.lastName}`);
        return res.status(200).json({ 
            message: "Student deleted successfully", 
            data: [], 
            code: 200 
        });
    } catch (error) {
        logger.error(`Error deleting student: ${error.message}`);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            data: [], 
            code: 500 
        });
    }
};
