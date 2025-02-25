import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseSchema = new Schema({
    courseCode: {
        type: String,
        required: true,        
        trim: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        maxlength: 2000,
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: [true, "Department is required"],
    },

    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 6,
    },

    status: {
        type: String,
        enum: ["Open", "Closed", "Waitlisted"],
        default: "Open",
    },

    institutionDomain: {
        type: String,
        required: [true, "Institution domain is required"],
        match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], 
    },
},
    { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
