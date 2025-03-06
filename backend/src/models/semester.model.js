import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Semester name is required"],
        trim: true,        
    },

    institutionDomain: {
        type: String,
        required: [true, "Institution domain is required"],
        match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
    },

    semesterCode: {
        type: String,
        required: [true, "Semester code is required"],
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
