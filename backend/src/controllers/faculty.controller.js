import { Faculty } from "../models/faculty.model.js";
import { Department } from "../models/department.model.js";
import { Admin } from "../models/admin.model.js";

import winston from "winston";
import bcrypt from "bcrypt";

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "faculty-logs.log" }),
  ],
});

// Add Faculty
export const addFaculty = async (req, res) => {
  try {
    const { firstName, lastName, collegeEmail, password, phone, institutionDomain, departmentId, designation, joiningDate, facultyId } = req.body;

    if (!collegeEmail || !firstName || !lastName || !password || !institutionDomain || !phone || !departmentId || !designation || !joiningDate || !facultyId) {
        const errorMessage = "All fields are required";
        logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
        return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Password length validation
    if (password.length < 8) {
      const errorMessage = "Password should be at least 8 characters";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }
    
    // Password length validation
    if (phone.length != 10) {
      const errorMessage = "Please enter a valid phone number";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(collegeEmail)) {
      const errorMessage = "Please provide a valid email address";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Validate Admin
    const admin = await Admin.findById(req.userId);
    if (!admin) {
      logger.error(`Admin not found for adminId: ${req.userId}`);
      return res.status(404).json({ message: "Admin not found", status: 404 });
    }

    // Check Institution Domain
    if (admin.institutionDomain !== institutionDomain) {
      logger.warn(`Admin domain mismatch. Expected: ${admin.institutionDomain}, Received: ${institutionDomain}`);
      return res.status(400).json({ message: "Faculty must belong to the same institution as the admin", status: 400 });
    }

    // Check if the email matches the institution domain
    if (!collegeEmail.endsWith(`@${admin.institutionDomain}`)) {
        const errorMessage = "Email must belong to the institution domain";
        logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
        return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Validate Department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found", status: 404 });
    }

    // Check if faculty with the same email exists
    const existingFacultyWithEmail = await Faculty.findOne({ collegeEmail });
    if (existingFacultyWithEmail) {
      logger.warn(`Faculty with email ${collegeEmail} already exists`);
      return res.status(400).json({ message: "Faculty with this email already exists", status: 400 });
    }

    const existingFacultyWithFacultyId = await Faculty.findOne({ facultyId });
    if (existingFacultyWithFacultyId) {
      logger.warn(`Faculty with ID ${facultyId} already exists`);
      return res.status(400).json({ message: "Faculty with this ID already exists", status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Faculty
    const newFaculty = new Faculty({
      firstName,
      lastName,
      collegeEmail,
      password: hashedPassword,
      facultyId,
      phone,
      institutionDomain,
      departmentId,
      designation,
      joiningDate,
    });

    // Save Faculty to DB
    await newFaculty.save();

    logger.info(`New faculty added successfully: ${newFaculty.name} in department: ${department.name}`);
    res.status(201).json({ message: "Faculty added successfully", faculty: newFaculty, status: 201 });
  } catch (error) {
    logger.error(`Error adding faculty: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

// Get All Faculties
export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().populate("departmentId");
    res.status(200).json({ faculties, status: 200 });
  } catch (error) {
    logger.error(`Error fetching faculties: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

// Get Faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate("departmentId");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found", status: 404 });
    }
    res.status(200).json({ faculty, status: 200 });
  } catch (error) {
    logger.error(`Error fetching faculty by ID: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

// Update Faculty
export const updateFaculty = async (req, res) => {
  try {
    const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFaculty) {
      return res.status(404).json({ message: "Faculty not found", status: 404 });
    }
    res.status(200).json({ message: "Faculty updated successfully", faculty: updatedFaculty, status: 200 });
  } catch (error) {
    logger.error(`Error updating faculty: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

// Delete Faculty
export const deleteFaculty = async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!deletedFaculty) {
      return res.status(404).json({ message: "Faculty not found", status: 404 });
    }
    logger.info(`Faculty deleted successfully: ${deletedFaculty.name}`);
    res.status(200).json({ message: "Faculty deleted successfully", status: 200 });
  } catch (error) {
    logger.error(`Error deleting faculty: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

