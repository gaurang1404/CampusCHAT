import { Section } from "../models/section.model.js";
import { Semester } from "../models/semester.model.js";
import { Course } from "../models/course.model.js";
import { Faculty } from "../models/faculty.model.js";

import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ filename: "section-logs.log" }),
    ],
});

export const addSection = async (req, res) => {
    try {
        const { name, semesterId } = req.body;

        const semester = await Semester.findById(semesterId);
        if (!semester) {
            logger.error(`Semester not found for semesterId: ${semesterId}`);
            return res.status(404).json({ message: "Semester not found" });
        }

        const existingSection = await Section.findOne({ name, semesterId });
        if (existingSection) {
            logger.error(`Section with name '${name}' already exists in semester: ${semesterId}`);
            return res.status(400).json({ message: "Section with this name already exists in the semester" });
        }

        const newSection = new Section({ name, semesterId });
        await newSection.save();

        semester.sections.push(newSection._id);
        await semester.save();

        logger.info(`New section added: ${newSection.name} under semester: ${semesterId}`);

        res.status(201).json({
            message: "Section added successfully",
            section: newSection,
        });
    } catch (error) {
        logger.error(`Error adding section: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const getSections = async (req, res) => {
    try {
        const sections = await Section.find()
            .populate("semesterId")  // Populate semester name
            .populate("students")
            .populate("courseFacultyMappings.courseId")
            .populate("courseFacultyMappings.facultyId");

        res.status(200).json({ sections });
    } catch (error) {
        logger.error(`Error fetching sections: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export const getSectionById = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id).populate("semesterId")  // Populate semester name
            .populate("students")
            .populate("courseFacultyMappings.courseId")
            .populate("courseFacultyMappings.facultyId");
        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        res.status(200).json({ section });
    } catch (error) {
        logger.error(`Error fetching section: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const updateSection = async (req, res) => {
    try {
        const updatedSection = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSection) {
            return res.status(404).json({ message: "Section not found" });
        }
        res.status(200).json({ message: "Section updated successfully", section: updatedSection });
    } catch (error) {
        logger.error(`Error updating section: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const deleteSection = async (req, res) => {
    try {
        const deletedSection = await Section.findByIdAndDelete(req.params.id);
        if (!deletedSection) {
            return res.status(404).json({ message: "Section not found" });
        }

        await Semester.findByIdAndUpdate(deletedSection.semesterId, {
            $pull: { sections: deletedSection._id },
        });

        logger.info(`Section deleted: ${deletedSection.name}`);
        res.status(200).json({ message: "Section deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting section: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Add Course Faculty Mapping to a Section with validations for Course and Faculty
export const addCourseFacultyMapping = async (req, res) => {
    try {
        const { sectionId, courseId, facultyId } = req.body;

        // Validate required fields
        if (!sectionId || !courseId || !facultyId) {
            const errorMessage = "Section ID, Course ID and Faculty ID are required";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ message: errorMessage });
        }

        // Validate Course existence
        const course = await Course.findById(courseId);
        if (!course) {
            logger.error(`Course not found for courseId: ${courseId}`);
            return res.status(404).json({ message: "Course not found" });
        }

        // Validate Faculty existence
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
            logger.error(`Faculty not found for facultyId: ${facultyId}`);
            return res.status(404).json({ message: "Faculty not found" });
        }

        console.log(course.departmentId + " " + faculty.departmentId);
        
        if(!course.departmentId.equals(faculty.departmentId)){
            const errorMessage = "Faculty should belong to same department that offers this course";
            logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
            return res.status(400).json({ message: errorMessage });
        }

        // Find the section by ID
        const section = await Section.findById(sectionId);
        if (!section) {
            logger.error(`Section not found for sectionId: ${sectionId}`);
            return res.status(404).json({ message: "Section not found" });
        }

        // Check if mapping already exists
        const mappingExists = section.courseFacultyMappings.some(mapping => {
            return mapping.courseId.toString() === courseId && mapping.facultyId.toString() === facultyId;
        });
        if (mappingExists) {
            logger.warn(`Mapping already exists for courseId: ${courseId} and facultyId: ${facultyId} in section: ${sectionId}`);
            return res.status(400).json({ message: "Mapping already exists for this course and faculty in the section" });
        }

        // Add new mapping
        section.courseFacultyMappings.push({ courseId, facultyId });
        await section.save();

        logger.info(`Added course-faculty mapping for courseId: ${courseId} and facultyId: ${facultyId} in section: ${sectionId}`);
        res.status(200).json({ message: "Course faculty mapping added successfully", section });
    } catch (error) {
        logger.error(`Error adding course faculty mapping: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
