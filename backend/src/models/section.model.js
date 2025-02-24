import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Section name is required"],
        trim: true
    },

    institutionDomain: {
        type: String,
        required: [true, "Institution domain is required"],
        match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
    },

    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: [true, "Associated semester is required"]
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    courseFacultyMappings: [{
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
