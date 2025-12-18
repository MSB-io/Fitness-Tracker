import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import TrainerRequest from "../models/TrainerRequest.js";
import TrainerPlan from "../models/TrainerPlan.js";
import { generateToken, protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, role } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        role: role || "user",
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "assignedTrainer",
      "name email"
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, profile } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/trainers
// @desc    Get all available trainers
// @access  Private
router.get("/trainers", protect, async (req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" }).select(
      "name email profile createdAt"
    );
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/trainer-request
// @desc    Request a trainer (user sends request)
// @access  Private
router.post("/trainer-request", protect, async (req, res) => {
  try {
    const { trainerId, message } = req.body;

    // Check if trainer exists and is actually a trainer
    const trainer = await User.findOne({ _id: trainerId, role: "trainer" });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if user already has an approved trainer
    if (req.user.assignedTrainer) {
      return res
        .status(400)
        .json({ message: "You already have an assigned trainer" });
    }

    // Check if there's already a pending request to this trainer
    const existingRequest = await TrainerRequest.findOne({
      user: req.user._id,
      trainer: trainerId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request to this trainer",
      });
    }

    // Create trainer request
    const request = await TrainerRequest.create({
      user: req.user._id,
      trainer: trainerId,
      message: message || "",
    });

    const populatedRequest = await TrainerRequest.findById(request._id)
      .populate("user", "name email")
      .populate("trainer", "name email");

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/trainer-request/my-request
// @desc    Get user's current trainer request status
// @access  Private
router.get("/trainer-request/my-request", protect, async (req, res) => {
  try {
    const request = await TrainerRequest.findOne({
      user: req.user._id,
      status: "pending",
    })
      .populate("trainer", "name email")
      .sort({ createdAt: -1 });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/auth/trainer-request/:requestId
// @desc    Cancel a pending trainer request
// @access  Private
router.delete("/trainer-request/:requestId", protect, async (req, res) => {
  try {
    const request = await TrainerRequest.findOne({
      _id: req.params.requestId,
      user: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or already processed" });
    }

    await request.deleteOne();
    res.json({ message: "Request cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/auth/profile/trainer
// @desc    Remove assigned trainer
// @access  Private
router.delete("/profile/trainer", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.assignedTrainer = null;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/my-plans
// @desc    Get user's assigned training plans
// @access  Private
router.get("/my-plans", protect, async (req, res) => {
  try {
    const plans = await TrainerPlan.find({ client: req.user._id })
      .populate("trainer", "name email")
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/my-plans/:planId
// @desc    Get single training plan details
// @access  Private
router.get("/my-plans/:planId", protect, async (req, res) => {
  try {
    const plan = await TrainerPlan.findOne({
      _id: req.params.planId,
      client: req.user._id,
    }).populate("trainer", "name email");

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
