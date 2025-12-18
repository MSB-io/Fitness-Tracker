import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: Number, // in grams
  carbs: Number,
  fat: Number,
  fiber: Number,
  servingSize: String,
  quantity: {
    type: Number,
    default: 1,
  },
  foodType: {
    type: String,
    enum: ["vegetarian", "vegan", "non-vegetarian", "eggetarian"],
    default: "vegetarian",
  },
  region: String, // North Indian, South Indian, etc.
});

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "evening-snack"],
      required: true,
    },
    foods: [foodItemSchema],
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFat: {
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

// Calculate totals before saving
mealSchema.pre("save", function (next) {
  this.totalCalories = this.foods.reduce(
    (sum, food) => sum + food.calories * food.quantity,
    0
  );
  this.totalProtein = this.foods.reduce(
    (sum, food) => sum + (food.protein || 0) * food.quantity,
    0
  );
  this.totalCarbs = this.foods.reduce(
    (sum, food) => sum + (food.carbs || 0) * food.quantity,
    0
  );
  this.totalFat = this.foods.reduce(
    (sum, food) => sum + (food.fat || 0) * food.quantity,
    0
  );
  next();
});

export default mongoose.model("Meal", mealSchema);
