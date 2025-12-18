// Format date to readable string
export const formatDate = (date, options = {}) => {
  const d = new Date(date); // Create Date object
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

// Format time
export const formatTime = (date) => {
  const d = new Date(date); // Create Date object
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate BMI
export const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  // If either value is missing, falsy, or zero → return null
  // Prevents division by zero errors
  const heightM = heightCm / 100; // Convert cm to meters
  const bmi = weight / (heightM * heightM); // BMI formula
  return bmi.toFixed(1); // Round to 1 decimal place
};

// Get BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return ""; // If bmi is null or undefined, return empty string
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

// Calculate daily calorie needs (Mifflin-St Jeor Equation)
export const calculateDailyCalories = (
  weight,
  height,
  age,
  gender,
  activityLevel
) => {
  if (!weight || !height || !age || !gender) return null; // Validate inputs

  // BMR calculation
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
  // Default to sedentary if activityLevel is invalid
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0"; // Handle null/undefined
  return num.toLocaleString(); // Convert number to locale string with commas
};

// Calculate percentage
export const calculatePercentage = (current, target) => {
  if (!target) return 0; // Prevent division by zero
  return Math.min(100, Math.round((current / target) * 100));
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = new Date(); // Current date and time
  const then = new Date(date); // Given date
  const seconds = Math.floor((now - then) / 1000); // Difference in seconds

  if (seconds < 60) return "Just now"; // Less than a minute
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`; // Less than an hour
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`; // Less than a day
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`; // Less than a week

  // For longer periods, return formatted date
  return formatDate(date);
};

// Debounce function - limits how often a function can be called
export const debounce = (func, wait) => {
  let timeout; // Timeout variable
  return function executedFunction(
    ...args // rest operator to capture arguments
  ) {
    const later = () => {
      // Function to be executed after wait time
      clearTimeout(timeout); // Clear previous timeout
      func(...args); // Call the original function with arguments
    };
    clearTimeout(timeout); // Clear previous timeout
    timeout = setTimeout(later, wait); // Set new timeout
  };
};
