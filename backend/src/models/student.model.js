import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },

    collegeEmail: {
        type: String,
        required: [true, "College email is required"],
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"], // Ensure correct email format
        validate: {
            validator: function (email) {
                // Ensure the email domain matches the institution domain
                return this.institutionDomain && email.endsWith(`@${this.institutionDomain}`);
            },
            message: "Email must belong to the registered institution domain",
        },
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password should be at least 8 characters"], // Enforce a minimum length of 8 for security    
    },

    institutionDomain: {
        type: String,
        required: [true, "Institution domain is required"],
        match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
    },

    studentId: {
        type: String,
        required: [true, "ID is required"],
        unique: true,
        trim: true
    },

    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: [true, "Associated section is required"]
    },

    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: [true, "Associated semester is required"]
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: [true, "Associated department is required"]
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Student = mongoose.model("Student", studentSchema);
