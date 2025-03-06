import { Department } from "../models/department.model.js";
import { Semester } from "../models/semester.model.js";
import { Section } from "../models/section.model.js";
import { Student } from "../models/student.model.js";
import { Faculty } from "../models/faculty.model.js";
import { Course } from "../models/course.model.js";

import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp(), winston.format.simple()) }),
    new winston.transports.File({ filename: "department-logs.log" })
  ]
});

export const addDepartment = async (req, res) => {
  try {
    const { name, description, location, departmentCode, dateEstablished } = req.body;

    if (!name || !description || !location || !departmentCode || !dateEstablished) {
      return res.status(400).json({ message: "All fields are required", status: 400 });
    }

    // Check if a department exists with the same departmentCode and institutionDomain
    const existingDepartment = await Department.findOne({
      departmentCode,
      institutionDomain: req.institutionDomain
    });

    if (existingDepartment) {
      return res.status(409).json({
        message: "A department with this code already exists in the institution",
        data: [],
        status: 409
      });
    }

    const newDepartment = new Department({
      name,
      institutionDomain: req.institutionDomain,
      departmentCode,
      description,
      location,
      dateEstablished
    });

    await newDepartment.save();
    logger.info(`New department added: ${newDepartment.name} (${newDepartment.departmentCode})`);

    return res.status(201).json({
      message: "Department added successfully",
      data: { department: newDepartment },
      status: 201
    });

  } catch (error) {
    logger.error(`Error adding department: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      data: [],
      status: 500
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ institutionDomain: req.institutionDomain })
      .populate("headOfDepartment")
      .populate("semesters");
    return res.status(200).json({
      message: "Departments fetched successfully",
      data: { departments },
      code: 200
    });
  } catch (error) {
    logger.error(`Error fetching departments: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server error",
      data: [],
      code: 500
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, institutionDomain: req.institutionDomain })
      .populate("headOfDepartment")
      .populate("semesters");
    if (!department) {
      return res.status(404).json({
        message: "Department not found or unauthorized",
        data: [],
        code: 404
      });
    }
    return res.status(200).json({
      message: "Department fetched successfully",
      data: { department },
      code: 200
    });
  } catch (error) {
    logger.error(`Error fetching department: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server error",
      data: [],
      code: 500
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentCode, description, location, dateEstablished } = req.body;

    const department = await Department.findOne({ _id: id, institutionDomain: req.institutionDomain });

    if (!department) {
      logger.warn(`Unauthorized update attempt by admin ${req.userId}`);
      return res.status(403).json({
        message: "Unauthorized access or department not found",
        data: [],
        code: 403
      });
    }

    department.name = name || department.name;
    department.departmentCode = departmentCode || department.departmentCode
    department.description = description || department.description
    department.location = location || department.location
    department.dateEstablished = dateEstablished || department.dateEstablished

    await department.save();

    logger.info(`Department updated: ${department.name} (${department.departmentCode})`);
    return res.status(200).json({
      message: "Department updated successfully",
      data: { department },
      code: 200
    });
  } catch (error) {
    logger.error(`Error updating department: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server error",
      data: [],
      code: 500
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, institutionDomain: req.institutionDomain });
    if (!department) {
      return res.status(404).json({
        message: "Department not found or unauthorized",
        data: [],
        code: 404
      });
    }

    await Student.deleteMany({ departmentId: department._id });
    await Faculty.deleteMany({ departmentId: department._id });
    await Course.deleteMany({ departmentId: department._id });
    await Semester.deleteMany({ departmentId: department._id });
    await Section.deleteMany({ departmentId: department._id });
    await Department.findByIdAndDelete(req.params.id);

    logger.info(`Department deleted: ${department.name} (${department.departmentCode})`);
    return res.status(200).json({
      message: "Department deleted successfully",
      data: [],
      code: 200
    });
  } catch (error) {
    logger.error(`Error deleting department: ${error.message}`);
    return res.status(500).json({
      message: "Internal Server error",
      data: [],
      code: 500
    });
  }
};
