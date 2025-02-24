import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Semester name is required"],
        trim: true,
        enum: ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"]
    },

    institutionDomain: {
        type: String,
        required: [true, "Institution domain is required"],
        match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
    },

    semesterCode: {
        type: String,
        required: [true, "Semester code is required"],
        unique: true,
        trim: true
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: [true, "Associated department is required"]
    },

    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    }],


    startDate: {
        type: String
    },

    endDate: {
        type: String
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Semester = mongoose.model("Semester", semesterSchema);
