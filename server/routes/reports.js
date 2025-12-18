import express from "express";
import Workout from "../models/Workout.js";
import Meal from "../models/Meal.js";
import WeightLog from "../models/WeightLog.js";
import Goal from "../models/Goal.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/reports/summary
// @desc    Get comprehensive progress report
// @access  Private
router.get("/summary", protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const dateQuery = { date: { $gte: start, $lte: end } };

    // Parallel data fetching
    const [workouts, meals, weightLogs, goals] = await Promise.all([
      Workout.find({ user: req.user._id, ...dateQuery }),
      Meal.find({ user: req.user._id, ...dateQuery }),
      WeightLog.find({ user: req.user._id, ...dateQuery }).sort({ date: 1 }),
      Goal.find({ user: req.user._id }),
    ]);

    // Workout stats
    const workoutStats = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + w.totalDuration, 0),
      totalCaloriesBurned: workouts.reduce(
        (sum, w) => sum + w.totalCaloriesBurned,
        0
      ),
      avgWorkoutsPerWeek: (
        workouts.length /
        ((end - start) / (7 * 24 * 60 * 60 * 1000))
      ).toFixed(1),
    };

    // Nutrition stats
    const nutritionStats = {
      avgDailyCalories:
        meals.length > 0
          ? Math.round(
              meals.reduce((sum, m) => sum + m.totalCalories, 0) / meals.length
            )
          : 0,
      avgDailyProtein:
        meals.length > 0
          ? Math.round(
              meals.reduce((sum, m) => sum + m.totalProtein, 0) / meals.length
            )
          : 0,
      totalMealsLogged: meals.length,
    };

    // Weight progress
    const weightProgress =
      weightLogs.length >= 2
        ? {
            startWeight: weightLogs[0].weight,
            currentWeight: weightLogs[weightLogs.length - 1].weight,
            change:
              weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight,
            trend: weightLogs,
          }
        : null;

    // Goals summary
    const goalsSummary = {
      total: goals.length,
      active: goals.filter((g) => g.status === "active").length,
      completed: goals.filter((g) => g.status === "completed").length,
      goals: goals,
    };

    res.json({
      period: { start, end },
      workoutStats,
      nutritionStats,
      weightProgress,
      goalsSummary,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/reports/weekly
// @desc    Get weekly breakdown
// @access  Private
router.get("/weekly", protect, async (req, res) => {
  try {
    const { weeks = 4 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const weeklyData = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $week: "$date" },
          workouts: { $sum: 1 },
          duration: { $sum: "$totalDuration" },
          calories: { $sum: "$totalCaloriesBurned" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/reports/daily-calories
// @desc    Get daily calorie intake/burn data
// @access  Private
router.get("/daily-calories", protect, async (req, res) => {
  try {
    const { days = 14 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(days));

    const [caloriesIn, caloriesOut] = await Promise.all([
      Meal.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            calories: { $sum: "$totalCalories" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Workout.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            calories: { $sum: "$totalCaloriesBurned" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ caloriesIn, caloriesOut });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
