import express from "express"
import WeightLog from "../models/WeightLog.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/weight
// @desc    Get weight logs for user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 30 } = req.query

    const logs = await WeightLog.find({ user: req.user._id }).sort({ date: -1 }).limit(Number.parseInt(limit))

    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/weight/latest
// @desc    Get latest weight entry
// @access  Private
router.get("/latest", protect, async (req, res) => {
  try {
    const latest = await WeightLog.findOne({ user: req.user._id }).sort({ date: -1 })

    res.json(latest)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   POST /api/weight
// @desc    Add weight log
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { weight, bodyFat, muscleMass, waterPercentage, notes, date } = req.body

    const log = await WeightLog.create({
      user: req.user._id,
      weight,
      bodyFat,
      muscleMass,
      waterPercentage,
      notes,
      date: date || Date.now(),
    })

    res.status(201).json(log)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/weight/:id
// @desc    Update weight log
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    let log = await WeightLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!log) {
      return res.status(404).json({ message: "Weight log not found" })
    }

    log = await WeightLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    res.json(log)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   DELETE /api/weight/:id
// @desc    Delete weight log
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const log = await WeightLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!log) {
      return res.status(404).json({ message: "Weight log not found" })
    }

    await log.deleteOne()

    res.json({ message: "Weight log removed" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/weight/stats/progress
// @desc    Get weight progress statistics
// @access  Private
router.get("/stats/progress", protect, async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user._id }).sort({ date: 1 })

    if (logs.length < 2) {
      return res.json({
        change: 0,
        startWeight: logs[0]?.weight || 0,
        currentWeight: logs[0]?.weight || 0,
        entries: logs.length,
      })
    }

    const startWeight = logs[0].weight
    const currentWeight = logs[logs.length - 1].weight
    const change = currentWeight - startWeight

    res.json({
      startWeight,
      currentWeight,
      change,
      percentChange: ((change / startWeight) * 100).toFixed(2),
      entries: logs.length,
      history: logs,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
