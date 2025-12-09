"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Mail, Activity, Dumbbell, Scale, Target, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import ProgressBar from "../../components/ui/ProgressBar"
import { trainerService } from "../../services/trainer"
import { formatDate, calculatePercentage } from "../../utils/helpers"

const ClientDetail = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchClientData()
  }, [id])

  const fetchClientData = async () => {
    try {
      const response = await trainerService.getClientDetail(id)
      setData(response)
    } catch (error) {
      console.error("Failed to fetch client data:", error)
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

  if (!data?.client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Client not found</p>
        <Link to="/trainer/clients">
          <Button variant="outline" className="mt-4 bg-transparent">
            Back to Clients
          </Button>
        </Link>
      </div>
    )
  }

  const { client, recentWorkouts, recentMeals, weightHistory, goals } = data

  // Prepare weight chart data
  const weightChartData =
    weightHistory
      ?.slice()
      .reverse()
      .map((log) => ({
        date: formatDate(log.date, { month: "short", day: "numeric" }),
        weight: log.weight,
      })) || []

  // Calculate recent stats
  const totalWorkoutMinutes = recentWorkouts?.reduce((sum, w) => sum + (w.totalDuration || 0), 0) || 0
  const totalCaloriesBurned = recentWorkouts?.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0) || 0
  const latestWeight = weightHistory?.[0]?.weight
  const weightChange = weightHistory?.length >= 2 ? weightHistory[0].weight - weightHistory[1].weight : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/trainer/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-medium">
            {client.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">{client.name}</h1>
            <p className="text-muted flex items-center gap-2">
              <Mail size={16} />
              {client.email}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Recent Workouts</p>
            <p className="text-xl font-bold text-primary">{recentWorkouts?.length || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Activity className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Minutes</p>
            <p className="text-xl font-bold text-primary">{totalWorkoutMinutes}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Scale className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Current Weight</p>
            <p className="text-xl font-bold text-primary">{latestWeight ? `${latestWeight} kg` : "N/A"}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              weightChange < 0 ? "bg-green-100" : weightChange > 0 ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            {weightChange < 0 ? (
              <TrendingDown className="text-green-600" size={20} />
            ) : (
              <TrendingUp className={weightChange > 0 ? "text-red-600" : "text-gray-600"} size={20} />
            )}
          </div>
          <div>
            <p className="text-sm text-muted">Weight Change</p>
            <p className="text-xl font-bold text-primary">
              {weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg` : "N/A"}
            </p>
          </div>
        </Card>
      </div>

      {/* Client Info and Weight Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Profile */}
        <Card>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted">Age</span>
                <span className="font-medium">{client.profile?.age || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted">Gender</span>
                <span className="font-medium capitalize">{client.profile?.gender || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted">Height</span>
                <span className="font-medium">
                  {client.profile?.height ? `${client.profile.height} cm` : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted">Activity Level</span>
                <span className="font-medium capitalize">
                  {client.profile?.activityLevel?.replace("_", " ") || "Not set"}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Weight Progress Chart */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Weight Progress</Card.Title>
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
                      dot={{ fill: "#000", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                <p>Not enough weight data to display chart</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Goals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <Card>
          <Card.Header>
            <Card.Title>Active Goals</Card.Title>
          </Card.Header>
          <Card.Content>
            {goals?.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-primary" />
                        <span className="font-medium text-primary">{goal.title}</span>
                      </div>
                      <Badge variant={goal.status === "completed" ? "success" : "warning"}>{goal.status}</Badge>
                    </div>
                    <ProgressBar value={goal.currentValue} max={goal.targetValue} />
                    <div className="flex justify-between text-sm text-muted mt-1">
                      <span>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span>{calculatePercentage(goal.currentValue, goal.targetValue)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <Target size={40} className="mx-auto mb-2 opacity-50" />
                <p>No active goals</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Workouts</Card.Title>
          </Card.Header>
          <Card.Content>
            {recentWorkouts?.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Dumbbell className="text-white" size={20} />
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <Dumbbell size={40} className="mx-auto mb-2 opacity-50" />
                <p>No recent workouts</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default ClientDetail
