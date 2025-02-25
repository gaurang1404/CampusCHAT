import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model.js';
import winston from 'winston';

// Logger setup with timestamp
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Adds timestamp to logs
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'admin-logs.log' })
  ],
});

// Register admin
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, institutionName, institutionDomain } = req.body;

    // Validate the input fields
    if (!email || !firstName || !lastName || !password || !institutionName || !institutionDomain) {
      const errorMessage = "All fields are required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      const errorMessage = "Please provide a valid email address";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Check if the email matches the institution domain
    if (!email.endsWith(`@${institutionDomain}`)) {
      const errorMessage = "Email must belong to the institution domain";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Password length validation
    if (password.length < 8) {
      const errorMessage = "Password should be at least 8 characters";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Check if an admin with the same email or institution domain exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: email }, { institutionDomain: institutionDomain }]
    });

    if (existingAdmin) {
      const errorMessage = existingAdmin.email === email
        ? "Admin with this email already exists"
        : "An admin is already registered with this institution domain";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      institutionName,
      institutionDomain,
    });

    // Save the admin to the database
    await newAdmin.save();

    // Log the success message with timestamp
    const successMessage = "Admin registered successfully!";
    logger.info(`${new Date().toISOString()} - Success: ${successMessage}`);
    
    return res.status(201).json({ message: successMessage, data: [], code: 201 });

  } catch (error) {
    // Log error with timestamp
    logger.error(`${new Date().toISOString()} - Error: Error registering admin - ${error.message}`);

    // General error handling for Mongoose-related issues
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      const errorMessage = 'Email and password are required';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const errorMessage = 'Admin not found';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(404).json({ message: errorMessage, data: [], code: 404 });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      const errorMessage = 'Incorrect password';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(401).json({ message: errorMessage, data: [], code: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: "Admin", institutionDomain: admin.institutionDomain },
      process.env.JWT_SECRET_KEY, // Ensure you have a secret key stored in your environment variables
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // Send success response with token
    logger.info(`${new Date().toISOString()} - Success: Admin logged in successfully`);
    return res.status(200).json({
      message: 'Login successful',
      data: [{ token }, {admin}],
      code: 200
    });

  } catch (error) {
    // Log error with timestamp
    logger.error(`${new Date().toISOString()} - Error: Error logging in - ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error', data: [], code: 500 });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { firstName, lastName, email, password, institutionName, institutionDomain } = req.body;

    // Validate required fields
    if (!adminId) {
      const errorMessage = "Admin ID is required";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Fetch the existing admin details
    const admin = await Admin.findById(adminId);
    if (!admin) {
      const errorMessage = "Admin not found";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(404).json({ message: errorMessage, data: [], code: 404 });
    }

    // Prevent email and domain duplication
    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({ email: email });
      if (existingEmail) {
        const errorMessage = "Another admin already uses this email";
        logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
        return res.status(400).json({ message: errorMessage, data: [], code: 400 });
      }
    }

    if (institutionDomain && institutionDomain !== admin.institutionDomain) {
      const existingDomain = await Admin.findOne({ institutionDomain });
      if (existingDomain) {
        const errorMessage = "Another admin already registered this institution domain";
        logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
        return res.status(400).json({ message: errorMessage, data: [], code: 400 });
      }
    }

    // Validate that the email belongs to the updated institution domain
    if (email && institutionDomain && !email.endsWith(`@${institutionDomain}`)) {
      const errorMessage = "Email must match the institution domain";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, data: [], code: 400 });
    }

    // Update fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email;
    if (institutionName) admin.institutionName = institutionName;
    if (institutionDomain) admin.institutionDomain = institutionDomain;

    // If password is being updated, hash it
    if (password) {
      if (password.length < 8) {
        const errorMessage = "Password should be at least 8 characters";
        logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
        return res.status(400).json({ message: errorMessage, data: [], code: 400 });
      }
      admin.password = await bcrypt.hash(password, 10);
    }

    // Save the updated admin
    await admin.save();

    // Log success message
    const successMessage = "Admin details updated successfully!";
    logger.info(`${new Date().toISOString()} - Success: ${successMessage}`);
    
    return res.status(200).json({ message: successMessage, data: [{admin}], code: 200 });

  } catch (error) {
    // Log error
    logger.error(`${new Date().toISOString()} - Error: Error updating admin - ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error", data: [], code: 500 });
  }
};
