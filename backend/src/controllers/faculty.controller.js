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
    const { firstName, lastName, email, password, phone, institutionDomain, departmentId, designation, joiningDate, facultyId } = req.body;

    if (!email || !firstName || !lastName || !password || !institutionDomain || !phone || !departmentId || !designation || !joiningDate || !facultyId) {
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
    
    // Phone length validation
    if (phone.length !== 10) {
      const errorMessage = "Please enter a valid phone number";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ 
        message: errorMessage, 
        data: [], 
        code: 400 
      });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      const errorMessage = "Please provide a valid email address";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ 
        message: errorMessage, 
        data: [], 
        code: 400 
      });
    }

    // Check Institution Domain
    if (req.institutionDomain !== institutionDomain) {
      logger.warn(`Admin domain mismatch. Expected: ${req.institutionDomain}, Received: ${institutionDomain}`);
      return res.status(400).json({ 
        message: "Faculty must belong to the same institution as the admin", 
        data: [], 
        code: 400 
      });
    }

    // Check if the email matches the institution domain
    if (!email.endsWith(`@${req.institutionDomain}`)) {
      const errorMessage = "Email must belong to the institution domain";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ 
        message: errorMessage, 
        data: [], 
        code: 400 
      });
    }

    // Validate Department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        message: "Department not found", 
        data: [], 
        code: 404 
      });
    }

    // Check if faculty with the same email exists
    const existingFacultyWithEmail = await Faculty.findOne({ email });
    if (existingFacultyWithEmail) {
      logger.warn(`Faculty with email ${email} already exists`);
      return res.status(400).json({ 
        message: "Faculty with this email already exists", 
        data: [], 
        code: 400 
      });
    }

    const existingFacultyWithFacultyId = await Faculty.findOne({ institutionDomain: req.institutionDomain, facultyId });
    
    if (existingFacultyWithFacultyId) {
      logger.warn(`Faculty with ID ${facultyId} already exists`);
      return res.status(400).json({ 
        message: "Faculty with this ID already exists", 
        data: [], 
        code: 400 
      });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Faculty
    const newFaculty = new Faculty({
      firstName,
      lastName,
      email,
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

    logger.info(`New faculty added successfully: ${newFaculty.firstName} ${newFaculty.lastName} in department: ${department.name}`);
    return res.status(201).json({ 
      message: "Faculty added successfully", 
      data: { faculty: newFaculty }, 
      code: 201 
    });
  } catch (error) {
    logger.error(`Error adding faculty: ${error.message}`);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      data: [], 
      code: 500 
    });
  }
};

// Get All Faculties
export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find({ institutionDomain: req.institutionDomain })
      .populate("departmentId")
      .populate("sections");

    return res.status(200).json({ 
      message: "Faculties fetched successfully", 
      data: { faculties }, 
      code: 200 
    });
  } catch (error) {
    logger.error(`Error fetching faculties: ${error.message}`);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      data: [], 
      code: 500 
    });
  }
};

// Get Faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ _id: req.params.id, institutionDomain: req.institutionDomain })
      .populate("departmentId")
      .populate("sections");

    if (!faculty) {
      return res.status(404).json({ 
        message: "Faculty not found or does not belong to your institution", 
        data: [], 
        code: 404 
      });
    }

    return res.status(200).json({ 
      message: "Faculty fetched successfully", 
      data: { faculty }, 
      code: 200 
    });
  } catch (error) {
    logger.error(`Error fetching faculty by ID: ${error.message}`);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      data: [], 
      code: 500 
    });
  }
};

// Update Faculty
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
        data: [],
        code: 400,
      });
    }

    // Ensure faculty exists and belongs to admin's institution domain
    const existingFaculty = await Faculty.findOne({ _id: id, institutionDomain: req.institutionDomain });
    if (!existingFaculty) {
      logger.warn(`Update failed: Faculty with ID ${id} not found or unauthorized access.`);
      return res.status(404).json({
        message: "Faculty not found or unauthorized update attempt",
        data: [],
        code: 404,
      });
    }

    logger.info(`Updating faculty with ID: ${id}`);

    if (updateData.email && !updateData.email.endsWith(`@${existingFaculty.institutionDomain}`)) {
      logger.warn(`Invalid email update attempt for faculty ID ${id}: Email must match institution domain.`);
      return res.status(400).json({
        message: "Email must belong to the institution domain",
        data: [],
        code: 400,
      });
    }

    if (updateData.password) {
      if (updateData.password.length < 8) {
        logger.warn(`Password update failed for faculty ID ${id}: Password too short.`);
        return res.status(400).json({
          message: "Password should be at least 8 characters",
          data: [],
          code: 400,
        });
      }
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.phone) {
      if (!/^\d{10}$/.test(updateData.phone)) {
        logger.warn(`Invalid phone number update attempt for faculty ID ${id}.`);
        return res.status(400).json({
          message: "Please enter a valid 10-digit phone number",
          data: [],
          code: 400,
        });
      }
    }

    if (updateData.role && existingFaculty.role !== "admin") {
      logger.warn(`Unauthorized role update attempt for faculty ID ${id}.`);
      return res.status(403).json({
        message: "Unauthorized to modify role",
        data: [],
        code: 403,
      });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`Faculty updated successfully: ${updatedFaculty.firstName} ${updatedFaculty.lastName}, ID: ${id}`);
    return res.status(200).json({
      message: "Faculty updated successfully",
      data: { faculty: updatedFaculty },
      code: 200,
    });
  } catch (error) {
    logger.error(`Error updating faculty with ID ${req.params.id}: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      code: 500,
    });
  }
};

// Delete Faculty
export const deleteFaculty = async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findOneAndDelete({ _id: req.params.id, institutionDomain: req.institutionDomain });

    if (!deletedFaculty) {
      return res.status(404).json({ 
        message: "Faculty not found or unauthorized deletion attempt", 
        data: [], 
        code: 404 
      });
    }

    logger.info(`Faculty deleted successfully: ${deletedFaculty.firstName} ${deletedFaculty.lastName}`);
    return res.status(200).json({ 
      message: "Faculty deleted successfully", 
      data: [], 
      code: 200 
    });
  } catch (error) {
    logger.error(`Error deleting faculty: ${error.message}`);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      data: [], 
      code: 500 
    });
  }
};

// Update Faculty Designation
export const updateFacultyDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation } = req.body;

    const allowedDesignations = [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ];

    if (!allowedDesignations.includes(designation)) {
      logger.warn(`Invalid designation update attempt for faculty ID ${id}: ${designation}`);
      return res.status(400).json({ 
        message: "Invalid designation provided.", 
        data: [], 
        code: 400 
      });
    }

    logger.info(`Updating designation for faculty ID: ${id} to ${designation}`);

    const faculty = await Faculty.findOneAndUpdate(
      { _id: id, institutionDomain: req.institutionDomain },
      { designation },
      { new: true, runValidators: true }
    );

    if (!faculty) {
      logger.warn(`Faculty with ID ${id} not found or unauthorized designation update.`);
      return res.status(404).json({ 
        message: "Faculty not found or unauthorized update.", 
        data: [], 
        code: 404 
      });
    }

    logger.info(`Designation updated successfully for faculty ID: ${id} to ${designation}`);

    return res.status(200).json({ 
      message: "Designation updated successfully.", 
      data: { faculty }, 
      code: 200 
    });
  } catch (error) {
    logger.error(`Error updating designation for faculty ID ${req.params.id}: ${error.message}`);
    return res.status(500).json({ 
      message: "An error occurred while updating the designation.", 
      data: [], 
      code: 500 
    });
  }
};
