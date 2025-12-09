import mongoose from "mongoose"

const trainerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
    },
    responseMessage: {
      type: String,
      maxlength: 500,
    },
    respondedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
trainerRequestSchema.index({ user: 1, trainer: 1 })
trainerRequestSchema.index({ trainer: 1, status: 1 })

export default mongoose.model("TrainerRequest", trainerRequestSchema)
