import express from "express";
import Meal from "../models/Meal.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/meals
// @desc    Get all meals for user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 20, page = 1 } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (type) query.type = type;

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit));

    const total = await Meal.countDocuments(query);

    res.json({
      meals,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/meals/today
// @desc    Get today's meals
// @access  Private
router.get("/today", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Meal.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ date: 1 });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fat: acc.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ meals, totals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/meals/:id
// @desc    Get single meal
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/meals
// @desc    Create a meal
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { type, foods, notes, date } = req.body;

    const meal = await Meal.create({
      user: req.user._id,
      type,
      foods,
      notes,
      date: date || Date.now(),
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/meals/:id
// @desc    Update a meal
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    const { type, foods, notes, date } = req.body;

    meal.type = type || meal.type;
    meal.foods = foods || meal.foods;
    meal.notes = notes !== undefined ? notes : meal.notes;
    meal.date = date || meal.date;

    await meal.save();

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/meals/:id
// @desc    Delete a meal
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    await meal.deleteOne();

    res.json({ message: "Meal removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/meals/stats/summary
// @desc    Get nutrition statistics
// @access  Private
router.get("/stats/summary", protect, async (req, res) => {
  try {
    const { period = "7" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(period));

    const stats = await Meal.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          dailyCalories: { $sum: "$totalCalories" },
          dailyProtein: { $sum: "$totalProtein" },
          dailyCarbs: { $sum: "$totalCarbs" },
          dailyFat: { $sum: "$totalFat" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
