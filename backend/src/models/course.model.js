import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseSchema = new Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
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
},
    { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
