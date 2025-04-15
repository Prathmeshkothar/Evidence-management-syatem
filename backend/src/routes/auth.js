import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

axios.post(`${BASE_URL}/api/auth/signup/officer`, formData)
  .then(res => console.log(res.data))
  .catch(err => console.error("Signup error:", err));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Helper function to get admin email
const getAdminEmail = async (policeStation) => {
  const admin = await User.findOne({
    policeStation,
    role: 'admin'
  });
  console.log('Found admin for police station:', policeStation, admin);
  return admin ? admin.email : process.env.SMTP_USER;
};

// Helper function to send approval email
const sendApprovalEmail = async (newUser) => {
  try {
    console.log('Starting approval email process for user:', newUser.email);
    
    if (!newUser || !newUser._id) {
      throw new Error('Invalid user data provided');
    }

    const approvalToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const approvalLink = `${process.env.FRONTEND_URL}/approve-user/${approvalToken}`;
    console.log('Generated approval link:', approvalLink);

    const adminEmail = await getAdminEmail(newUser.policeStation);
    if (!adminEmail) {
      throw new Error(`No admin email found for police station: ${newUser.policeStation}`);
    }
    console.log('Retrieved admin email:', adminEmail);

    const roleCapitalized = newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1);

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: `${roleCapitalized} Registration Approval Required`,
      html: `
        <h3>${roleCapitalized} Registration Request</h3>
        <p>A new ${newUser.role} has registered and requires your approval:</p>
        <ul>
          <li>Name: ${newUser.name}</li>
          <li>Email: ${newUser.email}</li>
          <li>Role: ${newUser.role}</li>
          <li>Police Station: ${newUser.policeStation}</li>
        </ul>
        <p>Click the link below to approve or reject this registration:</p>
        <a href="${approvalLink}">Review Registration</a>
      `
    };

    console.log('Attempting to send email with options:', { ...mailOptions, html: '[HTML Content]' });
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully to:', adminEmail);
  } catch (error) {
    console.error('Detailed error in sendApprovalEmail:', {
      error: error.message,
      stack: error.stack,
      user: newUser ? { id: newUser._id, email: newUser.email, policeStation: newUser.policeStation } : 'No user data'
    });
    throw error;
  }
};

// Admin Signup
router.post('/signup/admin', async (req, res) => {
  try {
    // Check if admin already exists for this police station
    const existingAdmin = await User.findOne({
      policeStation: req.body.policeStation,
      role: 'admin'
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'An admin already exists for this police station'
      });
    }

    const user = new User({
      ...req.body,
      status: 'approved' // Admin is auto-approved
    });

    await user.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Officer Signup
router.post('/signup/officer', async (req, res) => {
  try {
    // Find admin for the police station
    const admin = await User.findOne({
      policeStation: req.body.policeStation,
      role: 'admin'
    });

    if (!admin) {
      return res.status(400).json({
        message: 'No admin found for this police station'
      });
    }

    const user = new User(req.body);
    await user.save();

    // Send approval email to admin
    await sendApprovalEmail(user);

    res.status(201).json({
      message: 'Registration successful. Waiting for admin approval'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'approved') {
      return res.status(401).json({
        message: 'Your account is pending approval'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Pending Users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve User
router.post('/approve-user/:id', async (req, res) => {
  try {
    console.log('Processing user approval for ID:', req.params.id);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!user) {
      console.log('User not found for approval:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Sending approval notification to user:', user.email);
    // Send approval notification to user
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Account Registration Status',
      html: `
        <h3>Account Approved</h3>
        <p>Your account has been approved. You can now login to the Evidence Management System.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Approval notification sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send approval notification:', {
        error: emailError.message,
        user: user.email,
        emailOptions: { ...mailOptions, html: '[HTML Content]' }
      });
      // Continue with approval even if email fails
    }

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error in user approval process:', {
      error: error.message,
      userId: req.params.id
    });
    res.status(400).json({ message: error.message });
  }
});

// Reject User
router.post('/reject-user/:id', async (req, res) => {
  try {
    console.log('Processing user rejection for ID:', req.params.id);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!user) {
      console.log('User not found for rejection:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Sending rejection notification to user:', user.email);
    // Send rejection notification to user
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Account Registration Status',
      html: `
        <h3>Account Registration Update</h3>
        <p>We regret to inform you that your account registration has been rejected.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Rejection notification sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send rejection notification:', {
        error: emailError.message,
        user: user.email,
        emailOptions: { ...mailOptions, html: '[HTML Content]' }
      });
      // Continue with rejection even if email fails
    }

    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error in user rejection process:', {
      error: error.message,
      userId: req.params.id
    });
    res.status(400).json({ message: error.message });
  }
});

export default router;
