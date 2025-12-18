# FitTrack - MERN Stack Fitness Tracker

A full-stack fitness tracking application built with MongoDB, Express.js, React, and Node.js.

## Features

- **User Authentication**: JWT-based auth with user/trainer roles
- **Workout Logging**: Track exercises, sets, reps, duration, and calories burned
- **Nutrition Tracking**: Log meals with macro calculations (protein, carbs, fat)
- **Weight Monitoring**: Track weight progress over time with charts
- **Goal Setting**: Set and track fitness goals with deadlines
- **Trainer Features**: Trainers can assign clients, create plans, and monitor progress
- **Progress Reports**: Comprehensive reports with charts and statistics

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend

- React 18 with Vite
- React Router v6
- Recharts for data visualization
- Tailwind CSS for styling
- Axios for API calls

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Workouts

- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/stats/summary` - Get workout stats

### Meals

- `GET /api/meals` - Get all meals
- `GET /api/meals/today` - Get today's meals
- `POST /api/meals` - Create meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Weight

- `GET /api/weight` - Get weight logs
- `POST /api/weight` - Add weight entry
- `GET /api/weight/stats/progress` - Get progress stats

### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id/progress` - Update goal progress

### Trainer (Trainer role only)

- `GET /api/trainer/clients` - Get assigned clients
- `POST /api/trainer/plans` - Create training plan
- `GET /api/trainer/plans` - Get all plans

### Reports

- `GET /api/reports/summary` - Get comprehensive report
- `GET /api/reports/weekly` - Get weekly breakdown
