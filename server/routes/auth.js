import express from "express";
import db from "../db/connection.js";
import { validateUser, createUserDocument, createSafeUser } from "../models/User.js";

const router = express.Router();

// Login user
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if username and password are provided
    if (!username || !password) {
      res.status(400).send("Username and password are required");
      return;
    }
    
    // Find user in database
    let collection = await db.collection("users");
    let user = await collection.findOne({ username: username });
    
    if (!user) {
      res.status(401).send("Invalid username or password");
      return;
    }
    
    // Check password (simple check for now)
    if (user.password !== password) {
      res.status(401).send("Invalid username or password");
      return;
    }
    
    // Remove password from response
    const safeUser = createSafeUser(user);
    res.send(safeUser);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during login");
  }
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    // Get user data from request
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    };
    
    // Validate user data
    const validation = validateUser(userData);
    if (!validation.isValid) {
      res.status(400).send(validation.errors[0]);
      return;
    }
    
    // Check if user already exists
    let collection = await db.collection("users");
    let existingUser = await collection.findOne({ username: userData.username });
    
    if (existingUser) {
      res.status(400).send("Username already exists");
      return;
    }
    
    // Create new user
    const newUser = createUserDocument(userData);
    let result = await collection.insertOne(newUser);
    
    // Remove password from response
    const safeUser = createSafeUser(newUser);
    res.send(safeUser);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

export default router;
