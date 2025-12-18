"use client";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from "./components/layouts/AuthLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import Nutrition from "./pages/Nutrition";
import Weight from "./pages/Weight";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import MyPlan from "./pages/MyPlan";

// Trainer Pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import Clients from "./pages/trainer/Clients";
import ClientDetail from "./pages/trainer/ClientDetail";
import Plans from "./pages/trainer/Plans";
import PlanDetail from "./pages/trainer/PlanDetail";
import TrainerRequests from "./pages/trainer/Requests";

// Protected Route Component
// children: components to render if access is granted, eg. <Dashboard />
// allowedRoles: array of roles that are permitted to access the route, eg. ['trainer']
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext

  if (loading) {
    // Show loading spinner while checking auth status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />; // 'replace' prevents adding a new entry in the history stack, so user can't go back to protected page after logout
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Check if allowedRoles prop was passed
    // Check if user's role is NOT in the allowed list
    /*
    allowedRoles = ["trainer"]
    user.role = "user"

    allowedRoles.includes("user")  // false
    !false  // true ✅ Redirect!
or
    allowedRoles = ["trainer"]
    user.role = "trainer"

    allowedRoles.includes("trainer")  // true
    !true  // false ❌ Don't redirect, allow access
   */
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth(); // Get current user from AuthContext

  return (
    <Routes>
      {/* Auth Routes - wrapping login and register with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
      </Route>

      {/* Protected User Routes - wrapping with ProtectedRoute and MainLayout */}
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

      {/* Protected Trainer Routes - wrapping with ProtectedRoute (allowedRoles: trainer) and MainLayout */}
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
  );
}

export default App;
