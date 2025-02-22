import { Department } from "../models/department.model.js"
import { Semester } from "../models/semester.model.js";
import { Section } from "../models/section.model.js";
import { Admin } from "../models/admin.model.js"

import winston from 'winston'; // Importing winston for logging

// Logger setup with timestamp
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Adds timestamp to logs
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'department-logs.log' })
  ],
});

// Create a new department
export const addDepartment = async (req, res) => {
  try {
    const { name, institutionDomain, description, location, departmentCode, headOfDepartment } = req.body;

    // Find the institution domain from the admin (using the adminId from the JWT)
    const admin = await Admin.findById(req.userId);  // Using req.adminId from the JWT payload

    if (!admin) {
      logger.error(`Admin not found for adminId: ${req.userId}`); // Log error when admin is not found
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if the institution domain from the admin matches the provided domain
    if (admin.institutionDomain !== institutionDomain) {
      logger.warn(`Admin domain mismatch. Expected: ${admin.institutionDomain}, Received: ${institutionDomain}`); // Log warning for domain mismatch
      return res.status(400).json({ message: "Department must belong to the same institution" });
    }

    // Check if a department with the same name or code already exists
    const existingDepartmentByName = await Department.findOne({ name });
    const existingDepartmentByCode = await Department.findOne({ departmentCode });

    if (existingDepartmentByName) {
      logger.warn(`Department already exists with name: ${name}`);
      return res.status(400).json({ message: "Department with the same name already exists" });
    }

    if (existingDepartmentByCode) {
      logger.warn(`Department already exists with code: ${departmentCode}`);
      return res.status(400).json({ message: "Department with the same code already exists" });
    }

    // Create a new department
    const newDepartment = new Department({
      name,
      institutionDomain,
      departmentCode,
      description,
      location,
      headOfDepartment
    });

    // Save the department to the database
    await newDepartment.save();

    logger.info(`New department added successfully: ${newDepartment.name} with code: ${newDepartment.departmentCode}`); // Log success message

    // Respond with the created department data
    res.status(201).json({
      message: "Department added successfully",
      department: newDepartment
    });
  } catch (error) {
    logger.error(`Error adding department: ${error.message}`); // Log error if any occurs
    res.status(500).json({ message: "Internal Server error", error: error.message });
  }
};
// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("headOfDepartment")
      .populate("semesters");
    res.status(200).json({ departments });
  } catch (error) {
    logger.error(`Error fetching departments: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message });
  }
};

// Get a department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("headOfDepartment")
      .populate("semesters");
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ department });
  } catch (error) {
    logger.error(`Error fetching department by ID: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message });
  }
};

// Update a department
export const updateDepartment = async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated department
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department updated successfully", department: updatedDepartment });
  } catch (error) {
    logger.error(`Error updating department: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message });
  }
};

// Delete a department along with its semesters and sections
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find all semesters linked to this department
    const semesters = await Semester.find({ departmentId: department._id });

    // Collect all section IDs from these semesters
    const sectionIds = semesters.flatMap((semester) => semester.sections);

    // Delete all sections associated with these semesters
    await Section.deleteMany({ _id: { $in: sectionIds } });

    // Delete all semesters of this department
    await Semester.deleteMany({ departmentId: department._id });

    // Delete the department itself
    await Department.findByIdAndDelete(req.params.id);

    logger.info(`Department deleted: ${department.name} (${department.departmentCode}), along with its semesters and sections.`);
    res.status(200).json({ message: "Department, its semesters, and sections deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting department: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};