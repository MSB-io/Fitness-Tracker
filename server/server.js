import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/auth.js";
import workoutRoutes from "./routes/workouts.js";
import mealRoutes from "./routes/meals.js";
import weightRoutes from "./routes/weight.js";
import goalRoutes from "./routes/goals.js";
import trainerRoutes from "./routes/trainer.js";
import reportRoutes from "./routes/reports.js";

dotenv.config(); // Load environment variables

const app = express(); // Initialize Express app

// Connect to MongoDB
connectDB(); // Ensure this function handles connection errors internally

// Middleware - Updated CORS for production
// runs for every request
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "FitTrack API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
