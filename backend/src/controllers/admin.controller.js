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
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      const errorMessage = "Please provide a valid email address";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Check if the email matches the institution domain
    if (!email.endsWith(`@${institutionDomain}`)) {
      const errorMessage = "Email must belong to the institution domain";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Password length validation
    if (password.length < 8) {
      const errorMessage = "Password should be at least 8 characters";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Check if the email already exists in the database
    const existingAdmin = await Admin.findOne({ collegeEmail: email });
    if (existingAdmin) {
      const errorMessage = "Admin with this email already exists";
      logger.warn(`${new Date().toISOString()} - Warn: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      collegeEmail: email,
      password: hashedPassword,
      institutionName,
      institutionDomain,
    });

    // Save the admin to the database
    await newAdmin.save();

    // Log the success message with timestamp
    const successMessage = "Admin registered successfully!";
    logger.info(`${new Date().toISOString()} - Success: ${successMessage}`);
    
    return res.status(201).json({ message: successMessage, status: 201 });

  } catch (error) {
    // Log error with timestamp
    logger.error(`${new Date().toISOString()} - Error: Error registering admin - ${error.message}`);

    // General error handling for Mongoose-related issues
    return res.status(500).json({ message: "Internal Server Error", status: 500 });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      const errorMessage = 'Email and password are required';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(400).json({ message: errorMessage, status: 400 });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ collegeEmail: email });
    if (!admin) {
      const errorMessage = 'Admin not found';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(404).json({ message: errorMessage, status: 404 });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      const errorMessage = 'Incorrect password';
      logger.error(`${new Date().toISOString()} - Error: ${errorMessage}`);
      return res.status(401).json({ message: errorMessage, status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.collegeEmail },
      process.env.JWT_SECRET_KEY, // Ensure you have a secret key stored in your environment variables
      { expiresIn: '24h' } // Token expires in 1 hour
    );

    // Send success response with token
    logger.info(`${new Date().toISOString()} - Success: Admin logged in successfully`);
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      status: 200
    });

  } catch (error) {
    // Log error with timestamp
    logger.error(`${new Date().toISOString()} - Error: Error logging in - ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error', status: 500 });
  }
};
