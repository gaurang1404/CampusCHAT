import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Section name is required"],
        trim: true
    },

    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: [true, "Associated semester is required"]
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    courseFacultyMapping: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Section = mongoose.model("Section", sectionSchema);
