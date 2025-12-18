import mongoose from "mongoose";

const workoutPlanDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      weight: Number,
      duration: Number,
      notes: String,
    },
  ],
  isRestDay: {
    type: Boolean,
    default: false,
  },
});

const mealPlanDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  meals: [
    {
      type: {
        type: String,
        enum: ["breakfast", "lunch", "dinner", "snack"],
      },
      description: String,
      targetCalories: Number,
      suggestions: [String],
    },
  ],
});

const trainerPlanSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    workoutPlan: [workoutPlanDaySchema],
    mealPlan: [mealPlanDaySchema],
    dailyCalorieTarget: Number,
    dailyProteinTarget: Number,
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TrainerPlan", trainerPlanSchema);
