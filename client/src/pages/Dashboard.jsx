"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Dumbbell, Utensils, Scale, Target, TrendingUp, TrendingDown, Activity, Flame } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import ProgressBar from "../components/ui/ProgressBar"
import { useAuth } from "../context/AuthContext"
import { workoutService } from "../services/workouts"
import { mealService } from "../services/meals"
import { weightService } from "../services/weight"
import { goalService } from "../services/goals"
import { formatDate, formatNumber, calculatePercentage } from "../utils/helpers"

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    workoutStats: null,
    todayMeals: null,
    weightProgress: null,
    activeGoals: [],
    recentWorkouts: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [workoutStats, todayMeals, weightProgress, goals, workouts] = await Promise.all([
        workoutService.getStats(7),
        mealService.getToday(),
        weightService.getProgress(),
        goalService.getAll("active"),
        workoutService.getAll({ limit: 5 }),
      ])

      setData({
        workoutStats,
        todayMeals,
        weightProgress,
        activeGoals: goals.slice(0, 3),
        recentWorkouts: workouts.workouts || [],
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { workoutStats, todayMeals, weightProgress, activeGoals, recentWorkouts } = data

  // Prepare weight chart data
  const weightChartData =
    weightProgress?.history?.slice(-14).map((log) => ({
      date: formatDate(log.date, { month: "short", day: "numeric" }),
      weight: log.weight,
    })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted">Here's your fitness overview for today</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Workouts (7d)</p>
            <p className="text-2xl font-bold text-primary">{workoutStats?.totalWorkouts || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Flame className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Calories Burned</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(workoutStats?.totalCalories || 0)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Utensils className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Today's Calories</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(todayMeals?.totals?.calories || 0)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Scale className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Current Weight</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-primary">
                {weightProgress?.currentWeight ? `${weightProgress.currentWeight} kg` : "N/A"}
              </p>
              {weightProgress?.change !== 0 && (
                <span
                  className={`flex items-center text-sm ${weightProgress?.change < 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {weightProgress?.change < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                  {Math.abs(weightProgress?.change || 0).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Progress Chart */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Weight Progress</Card.Title>
              <Link to="/weight">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {weightChartData.length > 1 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tick={{ fontSize: 12 }}
                      stroke="#737373"
                      unit=" kg"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#000"
                      strokeWidth={2}
                      dot={{ fill: "#000", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                <p>Log more weight entries to see your progress</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Today's Nutrition */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Today's Nutrition</Card.Title>
              <Link to="/nutrition">
                <Button variant="ghost" size="sm">
                  Add Meal
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Calories</span>
                  <span className="font-medium">{todayMeals?.totals?.calories || 0} / 2000 kcal</span>
                </div>
                <ProgressBar value={todayMeals?.totals?.calories || 0} max={2000} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Protein</span>
                  <span className="font-medium">{todayMeals?.totals?.protein || 0} / 150 g</span>
                </div>
                <ProgressBar value={todayMeals?.totals?.protein || 0} max={150} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Carbs</span>
                  <span className="font-medium">{todayMeals?.totals?.carbs || 0} / 250 g</span>
                </div>
                <ProgressBar value={todayMeals?.totals?.carbs || 0} max={250} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Fat</span>
                  <span className="font-medium">{todayMeals?.totals?.fat || 0} / 65 g</span>
                </div>
                <ProgressBar value={todayMeals?.totals?.fat || 0} max={65} />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Recent Workouts</Card.Title>
              <Link to="/workouts">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <Link
                    key={workout._id}
                    to={`/workouts/${workout._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Activity className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{workout.name}</p>
                        <p className="text-sm text-muted">{formatDate(workout.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{workout.totalDuration} min</p>
                      <p className="text-sm text-muted">{workout.totalCaloriesBurned} kcal</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <p>No workouts logged yet</p>
                <Link to="/workouts">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Log Your First Workout
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Active Goals */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Active Goals</Card.Title>
              <Link to="/goals">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-primary" />
                        <p className="font-medium text-primary">{goal.title}</p>
                      </div>
                      <Badge variant={goal.progress >= 100 ? "success" : "default"}>
                        {calculatePercentage(goal.currentValue, goal.targetValue)}%
                      </Badge>
                    </div>
                    <ProgressBar value={goal.currentValue} max={goal.targetValue} />
                    <div className="flex justify-between text-sm text-muted mt-1">
                      <span>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span>Due: {formatDate(goal.deadline)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <p>No active goals</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Set Your First Goal
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
