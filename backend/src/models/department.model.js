import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
    },

    institutionDomain: {
      type: String,
      required: true,
    },

    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin', // Reference to Admin model for the head of department
    },

    numberOfFaculty: {
      type: Number,
      default: 0
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    departmentCode: {
      type: String,
      required: true,
      unique: true
    },

    coursesOffered: [{
      type: String,
      trim: true
    }],

    isActive: {
      type: Boolean,
      default: true
    },

    dateEstablished: {
      type: Date,
      default: Date.now
    },

    location: {
      type: String,
      trim: true
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    }
  });
  
  export const Department = mongoose.model("Department", departmentSchema);
  