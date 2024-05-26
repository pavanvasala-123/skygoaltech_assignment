const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");


// const signUp = async (req, res) => {
//   const { firstname, lastname, email, phoneno, password } = req.body;

//     if (!firstname || !phoneno || !email || !password) {
//       res.json("Required All Fields");
//     }

//   const user = await User.findOne({ email });

//   if (user) {
//     return res.json("User Already Registred");
//   }

//   try {
//     const salt = await bcrypt.genSalt(5);

//     const HashedPassword = await bcrypt.hash(password, salt);

//     const createUser = new User({
//       firstname,
//       lastname,
//       email,
//       phoneno,
//       password: HashedPassword,
//     });
//     await createUser.save();
//     res.status(201).json({ createUser });
//   } catch (err) {
//     res.status(500).json("Internal server Error");
//   }
// };

const signUp = async (req, res) => {
  const { firstname, lastname, email, phoneno, password } = req.body;

  // Validate required fields
  if (!firstname) {
    return res.status(400).json({ error: "First name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!phoneno) {
    return res.status(400).json({ error: "Phone number is required" });
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
      error: "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
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
      lastname,
      email,
      phoneno,
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
  try {
    if ((!email, !password)) {
      res.json("Required All Fields");
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      res.send("user not registred");
    }

    const PswrdMatch = await bcrypt.compare(password, existingUser.password);

    if (PswrdMatch) {
      const token = jwt.sign(
        { firstname: existingUser.firstname, email: existingUser.email },
        process.env.secret_access_token,
        { expiresIn: "1h" }
      );
      res.json(token);
    } else {
      res.json("invalid email or password ");
    }
  } catch (err) {
    res.json(err);
  }
};

const user = async(req,res)=>{
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
}

const users = async (req, res) => {
  allusers = await User.find();
  res.json(allusers);
};

module.exports = { signUp, login, users,user };
