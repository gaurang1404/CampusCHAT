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
    const { courseCode, name, description, departmentId, credits } = req.body;

    // Check for required fields
    if (!courseCode || !name || !description || !departmentId || credits == null) {
      return res.status(400).json({
        message: "All fields are required",
        data: [],
        code: 400,
      });
    }

    // Validate credits: must be a number between 1 and 6
    if (typeof credits !== "number" || credits < 1 || credits > 6) {
      return res.status(400).json({
        message: "Credits must be a number between 1 and 6",
        data: [],
        code: 400,
      });
    }

    // Validate description length: maximum 2000 characters
    if (description.length > 2000) {
      return res.status(400).json({
        message: "Description must not exceed 2000 characters",
        data: [],
        code: 400,
      });
    }

    const existingCourse = await Course.findOne({ courseCode, institutionDomain: req.institutionDomain });

    if (existingCourse) {
      return res.status(400).json({
        message: "Course with this code already exists",
        data: [],
        code: 400,
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        message: "Department not found",
        data: [],
        code: 404,
      });
    }

    const newCourse = new Course({
      courseCode,
      name,
      description,
      departmentId,
      credits,
      institutionDomain: req.institutionDomain,
    });

    await newCourse.save();
    logger.info(`New course added: ${newCourse.name} (${newCourse.courseCode})`);
    res.status(201).json({
      message: "Course added successfully",
      data: newCourse,
      code: 201,
    });
  } catch (error) {
    logger.error(`Error adding course: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};


export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ institutionDomain: req.institutionDomain }).populate("departmentId");
    res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching courses: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, institutionDomain: req.institutionDomain }).populate("departmentId");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: [],
        code: 404,
      });
    }
    res.status(200).json({
      message: "Course fetched successfully",
      data: course,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching course by ID: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseCode, name, description, departmentId, credits } = req.body;

    if (!courseCode || !name || !description || !departmentId || !credits) {
      return res.status(400).json({
        message: "All fields are required",
        data: [],
        code: 400,
      });
    }

    const course = await Course.findOne({ _id: id, institutionDomain: req.institutionDomain });
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: [],
        code: 404,
      });
    }

    if (course.courseCode !== courseCode) {
      const existingCourse = await Course.findOne({ courseCode, institutionDomain: req.institutionDomain });
      if (existingCourse) {
        return res.status(400).json({
          message: "Course with this code already exists",
          data: [],
          code: 400,
        });
      }
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        message: "Department not found",
        data: [],
        code: 404,
      });
    }

    course.courseCode = courseCode;
    course.name = name;
    course.description = description;
    course.departmentId = departmentId;
    course.credits = credits;

    await course.save();
    logger.info(`Course updated: ${course.name} (${course.courseCode})`);
    res.status(200).json({
      message: "Course updated successfully",
      data: course,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error updating course: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findOneAndDelete({ _id: req.params.id, institutionDomain: req.institutionDomain });
    if (!deletedCourse) {
      return res.status(404).json({
        message: "Course not found",
        data: [],
        code: 404,
      });
    }

    logger.info(`Course deleted: ${deletedCourse.name} (${deletedCourse.courseCode})`);
    res.status(200).json({
      message: "Course deleted successfully",
      data: deletedCourse,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error deleting course: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Open", "Closed", "Waitlisted"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        data: [],
        code: 400,
      });
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: id, institutionDomain: req.institutionDomain },
      { status },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        message: "Course not found",
        data: [],
        code: 404,
      });
    }

    logger.info(`Course status updated: ${updatedCourse.name} (${updatedCourse.courseCode}) - New Status: ${status}`);
    res.status(200).json({
      message: "Course status updated successfully",
      data: updatedCourse,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error updating course status: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const getOpenCourses = async (req, res) => {
  try {
    const openCourses = await Course.find({ status: "Open", institutionDomain: req.institutionDomain }).populate("departmentId");
    logger.info(`Open courses have been retrieved for ${req.institutionDomain}`);
    res.status(200).json({
      message: "Open courses fetched successfully",
      data: openCourses,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching open courses: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const getClosedCourses = async (req, res) => {
  try {
    const closedCourses = await Course.find({ status: "Closed", institutionDomain: req.institutionDomain }).populate("departmentId");
    logger.info(`Closed courses have been retrieved for ${req.institutionDomain}`);
    res.status(200).json({
      message: "Closed courses fetched successfully",
      data: closedCourses,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching closed courses: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};

export const getWaitlistedCourses = async (req, res) => {
  try {
    const waitlistedCourses = await Course.find({ status: "Waitlisted", institutionDomain: req.institutionDomain }).populate("departmentId");
    logger.info(`Waitlisted courses have been retrieved for ${req.institutionDomain}`);
    res.status(200).json({
      message: "Waitlisted courses fetched successfully",
      data: waitlistedCourses,
      code: 200,
    });
  } catch (error) {
    logger.error(`Error fetching waitlisted courses: ${error.message}`);
    res.status(500).json({
      message: "Internal Server error",
      data: error.message,
      code: 500,
    });
  }
};
