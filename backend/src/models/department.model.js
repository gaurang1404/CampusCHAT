import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Department name is required"],      
    },

    institutionDomain: {
      type: String,
      required: [true, "Institution domain is required"],      
      match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"]
    },

    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty', 
    },    

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    departmentCode: {
      type: String,
      required: true,      
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