import express from "express"
import Goal from "../models/Goal.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/goals
// @desc    Get all goals for user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query
    const query = { user: req.user._id }

    if (status) query.status = status

    const goals = await Goal.find(query).sort({ deadline: 1 })

    res.json(goals)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/goals/:id
// @desc    Get single goal
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" })
    }

    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   POST /api/goals
// @desc    Create a goal
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { type, title, description, targetValue, currentValue, unit, deadline } = req.body

    const goal = await Goal.create({
      user: req.user._id,
      type,
      title,
      description,
      targetValue,
      currentValue: currentValue || 0,
      unit,
      deadline,
    })

    res.status(201).json(goal)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" })
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.put("/:id/progress", protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" })
    }

    goal.currentValue = req.body.currentValue

    // Auto-complete if target reached
    if (goal.currentValue >= goal.targetValue) {
      goal.status = "completed"
    }

    await goal.save()

    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" })
    }

    await goal.deleteOne()

    res.json({ message: "Goal removed" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
