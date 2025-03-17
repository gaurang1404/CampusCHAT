import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  institutionDomain: {
    type: String,
    required: true,
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
  totalMarks: {
    type: Number,
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  marksScored: {
    type: Number,
    required: true,
  },
  examType: {
    type: String,
    enum: ["Midterm-1", "Midterm-2", "Midterm-3", "Reattempt-Midterm-1", "Reattempt-Midterm-2", "Reattempt-Midterm-3", "Final", "Reattempt-Final", "Quiz", "Reattempt-Quiz", "Assignment", "Reattempt-Assignment", "Lab", "Reattempt-Lab", "Final Lab", "Reattempt-Final-Lab", "Observation", "Attendance"], 
    required: true,
  },
  remarks: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export const Marks = mongoose.model("Marks", marksSchema);
