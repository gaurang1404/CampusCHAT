import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  institutionDomain: {
    type: String,
    required: [true, "Institution domain is required"],
    match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"],
  },

  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0), // Store only the date (without time)
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Restriction: Prevent duplicate attendance entries for the same student in the same section on the same day for the same institution
attendanceSchema.index(
  { institutionDomain: 1, sectionId: 1, studentId: 1, date: 1 },
  { unique: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
