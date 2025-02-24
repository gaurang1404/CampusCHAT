import mongoose from "mongoose";

// Admin schema - updated for stricter email and password validation
const adminSchema = new mongoose.Schema({
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

  email: {
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

  institutionName: {
    type: String,
    required: [true, "Institution name is required"],
    trim: true,
  },

  institutionDomain: {
    type: String,
    required: [true, "Institution domain is required"],
    unique: true,
    match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"], // Ensure domain format is correct
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// Middleware to enforce email domain validation
adminSchema.pre("save", function (next) {
  if (this.isModified("collegeEmail") && !this.collegeEmail.endsWith(`@${this.institutionDomain}`)) {
    return next(new Error("Admin email must match the institution domain"));
  }
  next();
});

export const Admin = mongoose.model("Admin", adminSchema);
