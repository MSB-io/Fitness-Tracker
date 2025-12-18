import mongoose from "mongoose";

const weightLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true, // in kg
    },
    bodyFat: Number, // percentage
    muscleMass: Number, // in kg
    waterPercentage: Number,
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

export default mongoose.model("WeightLog", weightLogSchema);
