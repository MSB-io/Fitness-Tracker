"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

// Layouts
import MainLayout from "./components/layouts/MainLayout"
import AuthLayout from "./components/layouts/AuthLayout"

// Auth Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"

// User Pages
import Dashboard from "./pages/Dashboard"
import Workouts from "./pages/Workouts"
import WorkoutDetail from "./pages/WorkoutDetail"
import Nutrition from "./pages/Nutrition"
import Weight from "./pages/Weight"
import Goals from "./pages/Goals"
import Reports from "./pages/Reports"
import Profile from "./pages/Profile"
import MyPlan from "./pages/MyPlan"

// Trainer Pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard"
import Clients from "./pages/trainer/Clients"
import ClientDetail from "./pages/trainer/ClientDetail"
import Plans from "./pages/trainer/Plans"
import PlanDetail from "./pages/trainer/PlanDetail"
import TrainerRequests from "./pages/trainer/Requests"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      </Route>

      {/* Protected User Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-plan" element={<MyPlan />} />
      </Route>

      {/* Protected Trainer Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/trainer/requests" element={<TrainerRequests />} />
        <Route path="/trainer/clients" element={<Clients />} />
        <Route path="/trainer/clients/:id" element={<ClientDetail />} />
        <Route path="/trainer/plans" element={<Plans />} />
        <Route path="/trainer/plans/:id" element={<PlanDetail />} />
      </Route>

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
