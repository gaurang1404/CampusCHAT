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

        const semester = await Semester.findOne({ _id: semesterId, institutionDomain: req.institutionDomain });

        if (!semester) {
            logger.error(`Semester not found for semesterId: ${semesterId}`);
            return res.status(404).json({
                message: "Semester not found",
                data: [],
                code: 404
            });
        }

        const existingSection = await Section.findOne({ name, semesterId, institutionDomain: req.institutionDomain });

        if (existingSection) {
            logger.error(`Section with name '${name}' already exists in semester: ${semesterId}`);
            return res.status(400).json({
                message: "Section with this name already exists in the semester",
                data: [],
                code: 400
            });
        }

        const newSection = new Section({ name, semesterId, institutionDomain: req.institutionDomain });

        await newSection.save();

        semester.sections.push(newSection._id);
        await semester.save();

        logger.info(`New section added: ${newSection.name} under semester: ${semesterId}`);

        return res.status(201).json({
            message: "Section added successfully",
            data: { section: newSection },
            code: 201
        });
    } catch (error) {
        logger.error(`Error adding section: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const getSections = async (req, res) => {
    try {
        const sections = await Section.find({ institutionDomain: req.institutionDomain })
            .populate("semesterId")
            .populate("students")
            .populate("courseFacultyMappings.courseId")
            .populate("courseFacultyMappings.facultyId");

        return res.status(200).json({
            message: "Sections fetched successfully",
            data: { sections },
            code: 200
        });
    } catch (error) {
        logger.error(`Error fetching sections: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const getSectionById = async (req, res) => {
    try {
        const section = await Section.findOne({ _id: req.params.id, institutionDomain: req.institutionDomain })
            .populate("semesterId")
            .populate("students")
            .populate("courseFacultyMappings.courseId")
            .populate("courseFacultyMappings.facultyId");

        if (!section) {
            return res.status(404).json({
                message: "Section not found",
                data: [],
                code: 404
            });
        }
        return res.status(200).json({
            message: "Section fetched successfully",
            data: { section },
            code: 200
        });
    } catch (error) {
        logger.error(`Error fetching section: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const updateSection = async (req, res) => {
    try {
        const updatedSection = await Section.findOneAndUpdate(
            { _id: req.params.id, institutionDomain: req.institutionDomain },
            req.body,
            { new: true }
        );

        if (!updatedSection) {
            return res.status(404).json({
                message: "Section not found",
                data: [],
                code: 404
            });
        }
        return res.status(200).json({
            message: "Section updated successfully",
            data: { section: updatedSection },
            code: 200
        });
    } catch (error) {
        logger.error(`Error updating section: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const deleteSection = async (req, res) => {
    try {
        const deletedSection = await Section.findOneAndDelete({ _id: req.params.id, institutionDomain: req.institutionDomain });

        if (!deletedSection) {
            return res.status(404).json({
                message: "Section not found",
                data: [],
                code: 404
            });
        }

        await Semester.findByIdAndUpdate(deletedSection.semesterId, {
            $pull: { sections: deletedSection._id },
        });

        logger.info(`Section deleted: ${deletedSection.name}`);
        return res.status(200).json({
            message: "Section deleted successfully",
            data: [],
            code: 200
        });
    } catch (error) {
        logger.error(`Error deleting section: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const addCourseFacultyMapping = async (req, res) => {
    try {
        const { sectionId, courseId, facultyId } = req.body;

        if (!sectionId || !courseId || !facultyId) {
            const errorMessage = "Section ID, Course ID and Faculty ID are required";
            logger.warn(errorMessage);
            return res.status(400).json({
                message: errorMessage,
                data: [],
                code: 400
            });
        }

        const course = await Course.findOne({ courseId, institutionDomain: req.institutionDomain });
        if (!course) {
            logger.error(`Course not found for courseId: ${courseId}`);
            return res.status(404).json({
                message: "Course not found",
                data: [],
                code: 404
            });
        }

        // Note: Corrected "findByOne" to "findOne"
        const faculty = await Faculty.findOne({ _id: facultyId, institutionDomain: req.institutionDomain });
        if (!faculty) {
            logger.error(`Faculty not found for facultyId: ${facultyId}`);
            return res.status(404).json({
                message: "Faculty not found",
                data: [],
                code: 404
            });
        }

        if (!course.departmentId.equals(faculty.departmentId)) {
            const errorMessage = "Faculty should belong to same department that offers this course";
            logger.warn(errorMessage);
            return res.status(400).json({
                message: errorMessage,
                data: [],
                code: 400
            });
        }

        const section = await Section.findOne({ _id: sectionId, institutionDomain: req.institutionDomain });
        if (!section) {
            logger.error(`Section not found for sectionId: ${sectionId}`);
            return res.status(404).json({
                message: "Section not found",
                data: [],
                code: 404
            });
        }

        const mappingExists = section.courseFacultyMappings.some(mapping =>
            mapping.courseId.toString() === courseId && mapping.facultyId.toString() === facultyId
        );
        if (mappingExists) {
            logger.warn(`Mapping already exists for courseId: ${courseId} and facultyId: ${facultyId} in section: ${sectionId}`);
            return res.status(400).json({
                message: "Mapping already exists for this course and faculty in the section",
                data: [],
                code: 400
            });
        }

        // Add new mapping to the section
        section.courseFacultyMappings.push({ courseId, facultyId });
        await section.save();

        // Add sectionId to faculty's sections array if not already present
        if (!faculty.sections.includes(sectionId)) {
            faculty.sections.push(sectionId);
            await faculty.save();
        }

        logger.info(`Added course-faculty mapping for courseId: ${courseId} and facultyId: ${facultyId} in section: ${sectionId}`);
        return res.status(200).json({
            message: "Course faculty mapping added successfully",
            data: { section },
            code: 200
        });
    } catch (error) {
        logger.error(`Error adding course faculty mapping: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};

export const deleteCourseFacultyMapping = async (req, res) => {
    try {
        const { sectionId, mappingId } = req.body;

        if (!sectionId || !mappingId) {
            const errorMessage = "Missing required fields: sectionId, mappingId";
            logger.warn(errorMessage);
            return res.status(400).json({
                message: errorMessage,
                data: [],
                code: 400
            });
        }

        const section = await Section.findOne({ _id: sectionId, institutionDomain: req.institutionDomain });

        if (!section) {
            logger.error(`Section not found for sectionId: ${sectionId}`);
            return res.status(404).json({
                message: "Section not found",
                data: [],
                code: 404
            });
        }

        const mapping = section.courseFacultyMappings.find(m => m._id.toString() === mappingId);
        if (!mapping) {
            const errorMessage = `Mapping not found for mappingId: ${mappingId} in section: ${sectionId}`;
            logger.warn(errorMessage);
            return res.status(400).json({
                message: errorMessage,
                data: [],
                code: 400
            });
        }

        // Remove the mapping
        section.courseFacultyMappings = section.courseFacultyMappings.filter(m => m._id.toString() !== mappingId);
        await section.save();

        // Check if the faculty has any other course mappings in the section
        const faculty = await Faculty.findById(mapping.facultyId);
        if (faculty) {
            const hasOtherMappings = section.courseFacultyMappings.some(m => m.facultyId.toString() === faculty._id.toString());
            // Remove sectionId from faculty if no other mappings exist in this section
            if (!hasOtherMappings) {
                faculty.sections = faculty.sections.filter(s => s.toString() !== sectionId);
                await faculty.save();
            }
        }

        logger.info(`Removed course-faculty mapping with mappingId: ${mappingId} from section: ${sectionId}`);
        return res.status(200).json({
            message: "Course faculty mapping removed successfully",
            data: { section },
            code: 200
        });
    } catch (error) {
        logger.error(`Error removing course faculty mapping: ${error.message}`);
        return res.status(500).json({
            message: "Internal Server Error",
            data: [],
            code: 500
        });
    }
};
