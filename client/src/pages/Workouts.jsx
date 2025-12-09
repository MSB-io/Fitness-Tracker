"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Dumbbell, Clock, Flame, Calendar, ChevronRight, Search } from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Modal from "../components/ui/Modal"
import EmptyState from "../components/ui/EmptyState"
import IndianWorkoutSelector from "../components/IndianWorkoutSelector"
import { workoutService } from "../services/workouts"
import { formatDate, formatNumber } from "../utils/helpers"

const exerciseCategories = [
  { value: "cardio", label: "Cardio" },
  { value: "strength", label: "Strength" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
  { value: "yoga", label: "Yoga" },
  { value: "traditional", label: "Traditional Indian" },
  { value: "sports", label: "Sports" },
  { value: "dance", label: "Dance" },
  { value: "other", label: "Other" },
]

const Workouts = () => {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    totalDuration: "",
    notes: "",
    exercises: [{ name: "", category: "strength", sets: "", reps: "", weight: "", caloriesBurned: "" }],
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWorkouts()
    fetchStats()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await workoutService.getAll({ limit: 50 })
      setWorkouts(response.workouts || [])
    } catch (error) {
      console.error("Failed to fetch workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await workoutService.getStats(30)
      setStats(response)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleAddExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        { name: "", category: "strength", sets: "", reps: "", weight: "", caloriesBurned: "" },
      ],
    })
  }

  const handleRemoveExercise = (index) => {
    if (formData.exercises.length > 1) {
      setFormData({
        ...formData,
        exercises: formData.exercises.filter((_, i) => i !== index),
      })
    }
  }

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.exercises]
    newExercises[index][field] = value
    setFormData({ ...formData, exercises: newExercises })
  }

  const handleSelectIndianWorkout = (workout) => {
    // Replace the last empty exercise or add a new one
    const lastExercise = formData.exercises[formData.exercises.length - 1]
    if (lastExercise.name === "") {
      const newExercises = [...formData.exercises]
      newExercises[newExercises.length - 1] = workout
      setFormData({ ...formData, exercises: newExercises })
    } else {
      setFormData({ ...formData, exercises: [...formData.exercises, workout] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        date: formData.date,
        totalDuration: Number.parseInt(formData.totalDuration) || 0,
        notes: formData.notes,
        exercises: formData.exercises.map((ex) => ({
          name: ex.name,
          category: ex.category,
          sets: Number.parseInt(ex.sets) || 0,
          reps: Number.parseInt(ex.reps) || 0,
          weight: Number.parseFloat(ex.weight) || 0,
          caloriesBurned: Number.parseInt(ex.caloriesBurned) || 0,
        })),
      }

      await workoutService.create(payload)
      setShowModal(false)
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        totalDuration: "",
        notes: "",
        exercises: [{ name: "", category: "strength", sets: "", reps: "", weight: "", caloriesBurned: "" }],
      })
      fetchWorkouts()
      fetchStats()
    } catch (error) {
      console.error("Failed to create workout:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredWorkouts = workouts.filter((workout) => workout.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getCategoryColor = (category) => {
    const colors = {
      cardio: "bg-red-100 text-red-800",
      strength: "bg-blue-100 text-blue-800",
      flexibility: "bg-green-100 text-green-800",
      balance: "bg-purple-100 text-purple-800",
      yoga: "bg-orange-100 text-orange-800",
      traditional: "bg-yellow-100 text-yellow-800",
      sports: "bg-pink-100 text-pink-800",
      dance: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors.other
  }

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
          <h1 className="text-2xl font-bold text-primary">Workouts</h1>
          <p className="text-muted">Track and manage your exercise routines</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Log Workout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Workouts (30d)</p>
            <p className="text-xl font-bold text-primary">{stats?.totalWorkouts || 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Duration</p>
            <p className="text-xl font-bold text-primary">{stats?.totalDuration || 0} min</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Flame className="text-orange-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Calories Burned</p>
            <p className="text-xl font-bold text-primary">{formatNumber(stats?.totalCalories || 0)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Avg Duration</p>
            <p className="text-xl font-bold text-primary">{Math.round(stats?.avgDuration || 0)} min</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <Input
          type="text"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workouts List */}
      {filteredWorkouts.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <Link key={workout._id} to={`/workouts/${workout._id}`} className="block">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Dumbbell className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{workout.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <span>{formatDate(workout.date)}</span>
                        <span>{workout.exercises?.length || 0} exercises</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-primary">{workout.totalDuration} min</p>
                      <p className="text-sm text-muted">{workout.totalCaloriesBurned} kcal</p>
                    </div>
                    <div className="hidden md:flex gap-1">
                      {[...new Set(workout.exercises?.map((e) => e.category))].slice(0, 3).map((category) => (
                        <span key={category} className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="text-muted" size={20} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="No workouts found"
          description={
            searchTerm ? "Try a different search term" : "Start logging your workouts to track your progress"
          }
          action={
            !searchTerm && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={20} className="mr-2" />
                Log Your First Workout
              </Button>
            )
          }
        />
      )}

      {/* Add Workout Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log New Workout" size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workout Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Gym Session"
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Total Duration (minutes)"
            type="number"
            value={formData.totalDuration}
            onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
            placeholder="e.g., 60"
            required
          />

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-primary">Exercises</label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleAddExercise}>
                  <Plus size={16} className="mr-1" />
                  Add Custom
                </Button>
              </div>
            </div>

            <IndianWorkoutSelector onSelectWorkout={handleSelectIndianWorkout} />

            <div className="space-y-4 mt-4">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">Exercise {index + 1}</span>
                    {formData.exercises.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveExercise(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                      required
                    />
                    <select
                      className="w-full px-4 py-2 border border-border rounded-lg bg-white"
                      value={exercise.category}
                      onChange={(e) => handleExerciseChange(index, "category", e.target.value)}
                    >
                      {exerciseCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Sets"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, "weight", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Calories burned"
                      value={exercise.caloriesBurned}
                      onChange={(e) => handleExerciseChange(index, "caloriesBurned", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="How did you feel?"
          />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Workout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Workouts
