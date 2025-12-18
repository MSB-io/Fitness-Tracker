import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "cardio",
      "strength",
      "flexibility",
      "balance",
      "yoga",
      "traditional",
      "sports",
      "dance",
      "other",
    ],
    default: "other",
  },
  sets: Number,
  reps: Number,
  weight: Number, // in kg
  duration: Number, // in minutes (for cardio)
  distance: Number, // in km (for cardio)
  caloriesBurned: Number,
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    exercises: [exerciseSchema],
    totalDuration: {
      type: Number, // in minutes
      required: true,
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0,
    },
    notes: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Workout", workoutSchema);
