import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

// HTTPS Redirect for production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Helmet for security headers with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware - Updated CORS for production
// runs for every request
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON request bodies

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth", authLimiter, authRoutes);
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
  
  // Don't expose stack traces in production
  if (process.env.NODE_ENV === "production") {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong!",
    });
  } else {
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong!",
      error: err.message,
      stack: err.stack,
    });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
