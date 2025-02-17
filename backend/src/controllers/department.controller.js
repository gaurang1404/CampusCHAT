import { Department } from "../models/department.model.js"
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
      const { name, institutionDomain, description, coursesOffered, location, departmentCode } = req.body;      
  
      // Find the institution domain from the admin (using the adminId from the JWT)
      const admin = await Admin.findById(req.adminId);  // Using req.adminId from the JWT payload
  
      if (!admin) {
        logger.error(`Admin not found for adminId: ${req.adminId}`); // Log error when admin is not found
        return res.status(404).json({ message: "Admin not found" });
      }
  
      // Check if the institution domain from the admin matches the provided domain
      if (admin.institutionDomain !== institutionDomain) {
        logger.warn(`Admin domain mismatch. Expected: ${admin.institutionDomain}, Received: ${institutionDomain}`); // Log warning for domain mismatch
        return res.status(400).json({ message: "Department must belong to the same institution" });
      }
  
      // Check if a department with the same name or code already exists
      const existingDepartment = await Department.findOne({
        $or: [{ name }, { departmentCode }] // Check both name and code
      });
      
      if (existingDepartment) {
        logger.warn(`Department already exists with name: ${name} or code: ${departmentCode}`); // Log warning if department exists
        return res.status(400).json({ message: "Department with the same name or code already exists" });
      }
  
      // Create a new department
      const newDepartment = new Department({
        name,
        institutionDomain,
        departmentCode,
        description,
        coursesOffered,
        location,
        headOfDepartment: req.body.headOfDepartment 
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
      const departments = await Department.find();
      res.status(200).json({ departments });
    } catch (error) {
      logger.error(`Error fetching departments: ${error.message}`);
      res.status(500).json({ message: "Internal Server error", error: error.message });
    }
  };
  
  // Get a department by ID
  export const getDepartmentById = async (req, res) => {
    try {
      const department = await Department.findById(req.params.id);
  
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
  
  // Delete a department
  export const deleteDepartment = async (req, res) => {
    try {
      const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
  
      if (!deletedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }

      logger.info(`Department deleted successfully: ${deletedDepartment.name} with code: ${deletedDepartment.departmentCode}`); // Log success message
  
      res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      logger.error(`Error deleting department: ${error.message}`);
      res.status(500).json({ message: "Internal Server error", error: error.message });
    }
  };