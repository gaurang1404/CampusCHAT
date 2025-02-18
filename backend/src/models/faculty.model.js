import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
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
    unique: true,
    match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
  },

  facultyId: {
    type: String,
    required: [true, "ID is required"],
    unique: true,
    trim: true
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{10}$/, "Phone number must be 10 digits"],
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: [true, "Department is required"],
  },

  designation: {
    type: String,
    required: [true, "Designation is required"],
    enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"],
  },

  joiningDate: {
    type: Date,
    required: [true, "Joining date is required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Faculty = mongoose.model("Faculty", facultySchema);
