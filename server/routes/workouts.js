import express from "express"
import Workout from "../models/Workout.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/workouts
// @desc    Get all workouts for user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, page = 1 } = req.query

    const query = { user: req.user._id }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))

    const total = await Workout.countDocuments(query)

    res.json({
      workouts,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    res.json(workout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   POST /api/workouts
// @desc    Create a workout
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, exercises, totalDuration, notes, date } = req.body

    // Calculate total calories burned
    const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0)

    const workout = await Workout.create({
      user: req.user._id,
      name,
      exercises,
      totalDuration,
      totalCaloriesBurned,
      notes,
      date: date || Date.now(),
    })

    res.status(201).json(workout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   PUT /api/workouts/:id
// @desc    Update a workout
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    let workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    const { name, exercises, totalDuration, notes, date } = req.body

    // Recalculate calories if exercises changed
    const totalCaloriesBurned = exercises
      ? exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0)
      : workout.totalCaloriesBurned

    workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { name, exercises, totalDuration, totalCaloriesBurned, notes, date },
      { new: true, runValidators: true },
    )

    res.json(workout)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   DELETE /api/workouts/:id
// @desc    Delete a workout
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" })
    }

    await workout.deleteOne()

    res.json({ message: "Workout removed" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// @route   GET /api/workouts/stats/summary
// @desc    Get workout statistics
// @access  Private
router.get("/stats/summary", protect, async (req, res) => {
  try {
    const { period = "7" } = req.query // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    const stats = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: "$totalDuration" },
          totalCalories: { $sum: "$totalCaloriesBurned" },
          avgDuration: { $avg: "$totalDuration" },
        },
      },
    ])

    res.json(
      stats[0] || {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        avgDuration: 0,
      },
    )
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
