import { Course } from "../models/course.model.js";
import { Department } from "../models/department.model.js";
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
    new winston.transports.File({ filename: "course-logs.log" }),
  ],
});

export const addCourse = async (req, res) => {
  try {
    const { courseCode, name, description, departmentId, credits  } = req.body;

    // Validate required fields
    if (!courseCode || !name || !description || !departmentId || !credits) {
      const errorMessage = "All fields are required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      logger.warn(`Course with code ${courseCode} already exists`);
      return res.status(400).json({ message: "Course with this code already exists", status: 400 });
    }

    // Validate Department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found", status: 404 });
    }

    // Create new course
    const newCourse = new Course({
      courseCode,
      name,
      description,
      departmentId,    
      credits     
    });

    // Save to DB
    await newCourse.save();

    logger.info(`New course added successfully: ${newCourse.name} (Code: ${newCourse.courseCode})`);
    res.status(201).json({ message: "Course added successfully", course: newCourse, status: 201 });
  } catch (error) {
    logger.error(`Error adding course: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("departmentId");
    res.status(200).json({ courses, status: 200 });
  } catch (error) {
    logger.error(`Error fetching courses: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("departmentId");
    if (!course) {
      return res.status(404).json({ message: "Course not found", status: 404 });
    }
    res.status(200).json({ course, status: 200 });
  } catch (error) {
    logger.error(`Error fetching course by ID: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, name, description, departmentId, credits } = req.body;

    // Validate required fields
    if (!courseCode || !name || !description || !departmentId || !credits) {
      return res.status(400).json({ message: "All fields are required", status: 400 });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found", status: 404 });
    }

    // Check if course code is unique when updating
    if (course.courseCode !== courseCode) {
      const existingCourse = await Course.findOne({ courseCode });
      if (existingCourse) {
        return res.status(400).json({ message: "Course with this code already exists", status: 400 });
      }
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found", status: 404 });
    }

    // Update course details
    course.courseCode = courseCode;
    course.name = name;
    course.description = description;
    course.departmentId = departmentId;
    course.credits = credits;

    await course.save();

    logger.info(`Course updated successfully: ${course.name} (Code: ${course.courseCode})`);
    res.status(200).json({ message: "Course updated successfully", course, status: 200 });
  } catch (error) {
    logger.error(`Error updating course: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found", status: 404 });
    }

    logger.info(`Course deleted successfully: ${deletedCourse.name} (Code: ${deletedCourse.courseCode})`);
    res.status(200).json({ message: "Course deleted successfully", status: 200 });
  } catch (error) {
    logger.error(`Error deleting course: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["Open", "Closed", "Waitlisted"].includes(status)) {
      const errorMessage = "Invalid status. Allowed values: Open, Closed, Waitlisted";
      logger.error(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Find and update course status
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedCourse) {
      logger.warn(`Course not found for ID: ${id}`);
      return res.status(404).json({ message: "Course not found", status: 404 });
    }

    logger.info(`Course status updated successfully: ${updatedCourse.name} (Code: ${updatedCourse.courseCode}) - New Status: ${status}`);
    res.status(200).json({ message: "Course status updated successfully", course: updatedCourse, status: 200 });
  } catch (error) {
    logger.error(`Error updating course status: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const getOpenCourses = async (req, res) => {
  try {
    const openCourses = await Course.find({ status: "Open" }).populate("departmentId");

    logger.info(`Fetched ${openCourses.length} open courses`);
    res.status(200).json({ courses: openCourses, status: 200 });
  } catch (error) {
    logger.error(`Error fetching open courses: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const getClosedCourses = async (req, res) => {
  try {
    const closedCourses = await Course.find({ status: "Closed" }).populate("departmentId");

    logger.info(`Fetched ${closedCourses.length} closed courses`);
    res.status(200).json({ courses: closedCourses, status: 200 });
  } catch (error) {
    logger.error(`Error fetching closed courses: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};

export const getWaitlistedCourses = async (req, res) => {
  try {
    const waitlistedCourses = await Course.find({ status: "Waitlisted" }).populate("departmentId");

    logger.info(`Fetched ${waitlistedCourses.length} waitlisted courses`);
    res.status(200).json({ courses: waitlistedCourses, status: 200 });
  } catch (error) {
    logger.error(`Error fetching waitlisted courses: ${error.message}`);
    res.status(500).json({ message: "Internal Server error", error: error.message, status: 500 });
  }
};
