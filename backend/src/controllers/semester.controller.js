import { Department } from "../models/department.model.js";
import { Semester } from "../models/semester.model.js";
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp(), winston.format.simple()) }),
        new winston.transports.File({ filename: 'semester-logs.log' })
    ],
});

export const addSemester = async (req, res) => {
    try {
        const { name, semesterCode, departmentId, startDate, endDate } = req.body;

        const department = await Department.findById(departmentId);
        if (!department) {
            logger.error(`Department not found for departmentId: ${departmentId}`);
            return res.status(404).json({ message: "Department not found" });
        }

        // Check if a semester with the same name or code already exists
        const existingSemesterByName = await Semester.findOne({ name });
        const existingSemesterByCode = await Semester.findOne({ semesterCode });

        if (existingSemesterByName) {
            logger.warn(`Semester already exists with name: ${name}`);
            return res.status(400).json({ message: "Semester with the same name already exists" });
        }

        if (existingSemesterByCode) {
            logger.warn(`Department already exists with code: ${semesterCode}`);
            return res.status(400).json({ message: "Semester with the same code already exists" });
        }

        const newSemester = new Semester({
            name,
            semesterCode,
            departmentId,
            startDate,
            endDate
        });

        await newSemester.save();

        department.semesters.push(newSemester._id);
        await department.save();

        logger.info(`New semester added successfully: ${newSemester.name} with code: ${newSemester.semesterCode}`);

        res.status(201).json({
            message: "Semester added successfully",
            semester: newSemester
        });
    } catch (error) {
        logger.error(`Error adding semester: ${error.message}`);
        res.status(500).json({ message: "Internal Server error", error: error.message });
    }
};

// Get all semesters
export const getSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find().populate("departmentId");
        res.status(200).json({ semesters });
    } catch (error) {
        logger.error(`Error fetching semesters: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get a semester by ID
export const getSemesterById = async (req, res) => {
    try {
        const semester = await Semester.findById(req.params.id)
            .populate("departmentId")
            .populate("sections");
        if (!semester) {
            return res.status(404).json({ message: "Semester not found" });
        }
        res.status(200).json({ semester });
    } catch (error) {
        logger.error(`Error fetching semester: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Update a semester
export const updateSemester = async (req, res) => {
    try {
        const updatedSemester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSemester) {
            return res.status(404).json({ message: "Semester not found" });
        }
        res.status(200).json({ message: "Semester updated successfully", semester: updatedSemester });
    } catch (error) {
        logger.error(`Error updating semester: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Delete a semester
export const deleteSemester = async (req, res) => {
    try {
        const deletedSemester = await Semester.findByIdAndDelete(req.params.id);
        if (!deletedSemester) {
            return res.status(404).json({ message: "Semester not found" });
        }

        await Department.findByIdAndUpdate(deletedSemester.departmentId, {
            $pull: { semesters: deletedSemester._id },
        });

        logger.info(`Semester deleted: ${deletedSemester.name} (${deletedSemester.semesterCode})`);
        res.status(200).json({ message: "Semester deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting semester: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
