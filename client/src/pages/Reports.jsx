"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { FileText, TrendingUp, Dumbbell, Utensils, Scale, Target } from "lucide-react"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Badge from "../components/ui/Badge"
import ProgressBar from "../components/ui/ProgressBar"
import { reportService } from "../services/reports"
import { formatDate, formatNumber } from "../utils/helpers"

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [calorieData, setCalorieData] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [summaryData, weeklyStats, dailyCalories] = await Promise.all([
        reportService.getSummary(dateRange.startDate, dateRange.endDate),
        reportService.getWeekly(4),
        reportService.getDailyCalories(14),
      ])

      setReport(summaryData)
      setWeeklyData(weeklyStats)
      setCalorieData(dailyCalories)
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare calorie in/out chart data
  const calorieChartData = []
  if (calorieData) {
    const allDates = [
      ...new Set([...calorieData.caloriesIn.map((d) => d._id), ...calorieData.caloriesOut.map((d) => d._id)]),
    ].sort()

    allDates.forEach((date) => {
      const inData = calorieData.caloriesIn.find((d) => d._id === date)
      const outData = calorieData.caloriesOut.find((d) => d._id === date)
      calorieChartData.push({
        date: date.slice(-5),
        consumed: inData?.calories || 0,
        burned: outData?.calories || 0,
      })
    })
  }

  // Prepare weekly workout chart data
  const weeklyChartData = weeklyData.map((week, index) => ({
    week: `Week ${index + 1}`,
    workouts: week.workouts,
    duration: week.duration,
    calories: week.calories,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Progress Reports</h1>
          <p className="text-muted">Comprehensive view of your fitness journey</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-36"
            />
            <span className="text-muted">to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Workouts</p>
              <p className="text-xl font-bold text-primary">{report?.workoutStats?.totalWorkouts || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Workout Minutes</p>
              <p className="text-xl font-bold text-primary">{formatNumber(report?.workoutStats?.totalDuration || 0)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Utensils className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Avg Daily Calories</p>
              <p className="text-xl font-bold text-primary">{report?.nutritionStats?.avgDailyCalories || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scale className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Weight Change</p>
              <p className="text-xl font-bold text-primary">
                {report?.weightProgress
                  ? `${report.weightProgress.change > 0 ? "+" : ""}${report.weightProgress.change.toFixed(1)} kg`
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Balance Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Calorie Balance (14 days)</Card.Title>
            <Card.Description>Calories consumed vs burned</Card.Description>
          </Card.Header>
          <Card.Content>
            {calorieChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calorieChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="consumed"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="burned"
                      stackId="2"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                <p>No calorie data available</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Weekly Workout Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Weekly Workout Summary</Card.Title>
            <Card.Description>Workout frequency and duration</Card.Description>
          </Card.Header>
          <Card.Content>
            {weeklyChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#737373" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="workouts" fill="#000" name="Workouts" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="duration" fill="#737373" name="Minutes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                <p>No workout data available</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Weight Progress Chart */}
      {report?.weightProgress?.trend?.length > 1 && (
        <Card>
          <Card.Header>
            <Card.Title>Weight Progress</Card.Title>
            <Card.Description>
              From {report.weightProgress.startWeight}kg to {report.weightProgress.currentWeight}kg
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={report.weightProgress.trend.map((log) => ({
                    date: formatDate(log.date, { month: "short", day: "numeric" }),
                    weight: log.weight,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12 }} stroke="#737373" unit=" kg" />
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
          </Card.Content>
        </Card>
      )}

      {/* Goals Summary */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Goals Overview</Card.Title>
              <Card.Description>Track your fitness goal progress</Card.Description>
            </div>
            <div className="flex gap-2">
              <Badge variant="success">{report?.goalsSummary?.completed || 0} Completed</Badge>
              <Badge variant="warning">{report?.goalsSummary?.active || 0} Active</Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {report?.goalsSummary?.goals?.length > 0 ? (
            <div className="space-y-4">
              {report.goalsSummary.goals.slice(0, 5).map((goal) => (
                <div key={goal._id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-primary">{goal.title}</p>
                      <span className="text-sm text-muted">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <ProgressBar value={goal.currentValue} max={goal.targetValue} />
                  </div>
                  <Badge variant={goal.status === "completed" ? "success" : "warning"}>{goal.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <Target size={40} className="mx-auto mb-2 opacity-50" />
              <p>No goals set yet</p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Report Summary Card */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <Card.Title>Report Summary</Card.Title>
              <Card.Description>
                Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{report?.workoutStats?.totalWorkouts || 0}</p>
              <p className="text-sm text-muted">Workouts Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">
                {formatNumber(report?.workoutStats?.totalCaloriesBurned || 0)}
              </p>
              <p className="text-sm text-muted">Calories Burned</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{report?.nutritionStats?.totalMealsLogged || 0}</p>
              <p className="text-sm text-muted">Meals Logged</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{report?.workoutStats?.avgWorkoutsPerWeek || 0}</p>
              <p className="text-sm text-muted">Avg Workouts/Week</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default Reports
