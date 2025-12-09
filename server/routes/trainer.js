import express from "express"
import User from "../models/User.js"
import TrainerPlan from "../models/TrainerPlan.js"
import TrainerRequest from "../models/TrainerRequest.js"
import Workout from "../models/Workout.js"
import Meal from "../models/Meal.js"
import WeightLog from "../models/WeightLog.js"
import Goal from "../models/Goal.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/trainer/clients
// @desc    Get all clients for trainer
// @access  Private (Trainer only)
router.get("/clients", protect, authorize("trainer"), async (req, res) => {
  try {
    const clients = await User.find({
      assignedTrainer: req.user._id,
      role: "user",
    }).select("-password")

    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/trainer/clients/:clientId
// @desc    Get client details with recent activity
// @access  Private (Trainer only)
router.get("/clients/:clientId", protect, authorize("trainer"), async (req, res) => {
  try {
    const client = await User.findOne({
      _id: req.params.clientId,
      assignedTrainer: req.user._id,
    }).select("-password")

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    // Get recent data
    const [recentWorkouts, recentMeals, weightHistory, goals] = await Promise.all([
      Workout.find({ user: client._id }).sort({ date: -1 }).limit(5),
      Meal.find({ user: client._id }).sort({ date: -1 }).limit(10),
      WeightLog.find({ user: client._id }).sort({ date: -1 }).limit(10),
      Goal.find({ user: client._id, status: "active" }),
    ])

    res.json({
      client,
      recentWorkouts,
      recentMeals,
      weightHistory,
      goals,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   POST /api/trainer/clients/:clientId/assign
// @desc    Assign a client to trainer
// @access  Private (Trainer only)
router.post("/clients/:clientId/assign", protect, authorize("trainer"), async (req, res) => {
  try {
    const client = await User.findById(req.params.clientId)

    if (!client) {
      return res.status(404).json({ message: "User not found" })
    }

    if (client.role !== "user") {
      return res.status(400).json({ message: "Can only assign regular users as clients" })
    }

    client.assignedTrainer = req.user._id
    await client.save()

    res.json({ message: "Client assigned successfully", client })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/trainer/plans
// @desc    Get all plans created by trainer
// @access  Private (Trainer only)
router.get("/plans", protect, authorize("trainer"), async (req, res) => {
  try {
    const plans = await TrainerPlan.find({ trainer: req.user._id })
      .populate("client", "name email")
      .sort({ createdAt: -1 })

    res.json(plans)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/trainer/plans/:planId
// @desc    Get single plan
// @access  Private (Trainer only)
router.get("/plans/:planId", protect, authorize("trainer"), async (req, res) => {
  try {
    const plan = await TrainerPlan.findOne({
      _id: req.params.planId,
      trainer: req.user._id,
    }).populate("client", "name email profile")

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" })
    }

    res.json(plan)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   POST /api/trainer/plans
// @desc    Create a plan for client
// @access  Private (Trainer only)
router.post("/plans", protect, authorize("trainer"), async (req, res) => {
  try {
    const {
      clientId,
      name,
      description,
      workoutPlan,
      mealPlan,
      dailyCalorieTarget,
      dailyProteinTarget,
      startDate,
      endDate,
      notes,
    } = req.body

    // Verify client belongs to trainer
    const client = await User.findOne({
      _id: clientId,
      assignedTrainer: req.user._id,
    })

    if (!client) {
      return res.status(404).json({ message: "Client not found or not assigned to you" })
    }

    const plan = await TrainerPlan.create({
      trainer: req.user._id,
      client: clientId,
      name,
      description,
      workoutPlan,
      mealPlan,
      dailyCalorieTarget,
      dailyProteinTarget,
      startDate,
      endDate,
      notes,
    })

    res.status(201).json(plan)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/trainer/plans/:planId
// @desc    Update a plan
// @access  Private (Trainer only)
router.put("/plans/:planId", protect, authorize("trainer"), async (req, res) => {
  try {
    let plan = await TrainerPlan.findOne({
      _id: req.params.planId,
      trainer: req.user._id,
    })

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" })
    }

    plan = await TrainerPlan.findByIdAndUpdate(req.params.planId, req.body, {
      new: true,
      runValidators: true,
    }).populate("client", "name email")

    res.json(plan)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   DELETE /api/trainer/plans/:planId
// @desc    Delete a plan
// @access  Private (Trainer only)
router.delete("/plans/:planId", protect, authorize("trainer"), async (req, res) => {
  try {
    const plan = await TrainerPlan.findOne({
      _id: req.params.planId,
      trainer: req.user._id,
    })

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" })
    }

    await plan.deleteOne()

    res.json({ message: "Plan removed" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/trainer/requests
// @desc    Get all pending trainer requests
// @access  Private (Trainer only)
router.get("/requests", protect, authorize("trainer"), async (req, res) => {
  try {
    const requests = await TrainerRequest.find({
      trainer: req.user._id,
      status: "pending",
    })
      .populate("user", "name email profile")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/trainer/requests/:requestId/approve
// @desc    Approve a trainer request
// @access  Private (Trainer only)
router.put("/requests/:requestId/approve", protect, authorize("trainer"), async (req, res) => {
  try {
    const { responseMessage } = req.body

    const request = await TrainerRequest.findOne({
      _id: req.params.requestId,
      trainer: req.user._id,
      status: "pending",
    })

    if (!request) {
      return res.status(404).json({ message: "Request not found or already processed" })
    }

    // Update request status
    request.status = "approved"
    request.responseMessage = responseMessage || ""
    request.respondedAt = new Date()
    await request.save()

    // Assign trainer to user
    const user = await User.findById(request.user)
    user.assignedTrainer = req.user._id
    await user.save()

    const populatedRequest = await TrainerRequest.findById(request._id)
      .populate("user", "name email")
      .populate("trainer", "name email")

    res.json(populatedRequest)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/trainer/requests/:requestId/reject
// @desc    Reject a trainer request
// @access  Private (Trainer only)
router.put("/requests/:requestId/reject", protect, authorize("trainer"), async (req, res) => {
  try {
    const { responseMessage } = req.body

    const request = await TrainerRequest.findOne({
      _id: req.params.requestId,
      trainer: req.user._id,
      status: "pending",
    })

    if (!request) {
      return res.status(404).json({ message: "Request not found or already processed" })
    }

    // Update request status
    request.status = "rejected"
    request.responseMessage = responseMessage || ""
    request.respondedAt = new Date()
    await request.save()

    const populatedRequest = await TrainerRequest.findById(request._id)
      .populate("user", "name email")
      .populate("trainer", "name email")

    res.json(populatedRequest)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
