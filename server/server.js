
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const User = require("./models/user");
const connectDB = require("./connectDB");
const formidableMiddleware = require('express-formidable');

connectDB();
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads/"), // Use an absolute path
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });



// Create a new user
app.post("/api/users", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const profileImage = req.file.filename;

    const user = new User({ firstName, lastName, email, phone, profileImage });
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update user by ID
app.put("/api/users/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { firstName, lastName, email, phone } = req.body;
    if (req.file) {
      user.profileImage = req.file.filename;
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
