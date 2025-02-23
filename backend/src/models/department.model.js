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
      ref: 'Faculty', 
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

    isActive: {
      type: Boolean,
      default: true
    },

    dateEstablished: {
      type: String,      
    },

    location: {
      type: String,
      trim: true
    },
    
    semesters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
    }],

    createdAt: {
      type: Date,
      default: Date.now,
    }
});

export const Department = mongoose.model("Department", departmentSchema);