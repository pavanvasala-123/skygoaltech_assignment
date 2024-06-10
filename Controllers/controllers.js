const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const signUp = async (req, res) => {
  const { firstname, email,  password } = req.body;

  // Validate required fields
  if (!firstname) {
    return res.status(400).json({ error: "First name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password validation (at least 8 characters, one uppercase, one lowercase, one number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    });
  }

  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const createUser = new User({
      firstname,
      email,
      password: hashedPassword,
    });
    await createUser.save();

    res.status(201).json({ user: createUser });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Required All Fields" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "User not registered" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordMatch) {
      const token = jwt.sign(
        { firstname: existingUser.firstname, email: existingUser.email },
        process.env.secret_access_token,
        { expiresIn: "1h" }
      );
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const user = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const users = async (req, res) => {
  allusers = await User.find();
  res.json(allusers);
};

const deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: "All users have been deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//password reset
const RequestpasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: "User with given email does not exist" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "no-reply@example.com",
      to: user.email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
      http://${req.headers.host}/users/reset-password/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("There was an error: ", err);
        return res.status(500).json({ error: "Error sending email" });
      } else {
        res.status(200).json("Recovery email sent");
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password
const ResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" });

    const salt = await bcrypt.genSalt(5);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  signUp,
  login,
  users,
  user,
  deleteUserById,
  deleteAllUsers,
  RequestpasswordReset,
  ResetPassword,
};
