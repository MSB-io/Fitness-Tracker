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

## Project Structure

\`\`\`
fittrack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── package.json
│
└── README.md
\`\`\`

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd fittrack
\`\`\`

2. **Setup Backend**
\`\`\`bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
\`\`\`

3. **Setup Frontend**
\`\`\`bash
cd client
npm install
cp .env.example .env
# Edit .env if needed (API URL)
npm run dev
\`\`\`

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

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

## Environment Variables

### Server (.env)
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
\`\`\`

### Client (.env)
\`\`\`
VITE_API_URL=http://localhost:5000/api
\`\`\`

## License

MIT
