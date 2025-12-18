import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "weight_loss",
        "weight_gain",
        "muscle_gain",
        "endurance",
        "strength",
        "flexibility",
        "custom",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      required: true, // kg, lbs, reps, minutes, etc.
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for progress percentage
goalSchema.virtual("progress").get(function () {
  if (this.targetValue === 0) return 0;
  return Math.min(100, (this.currentValue / this.targetValue) * 100);
});

goalSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Goal", goalSchema);
