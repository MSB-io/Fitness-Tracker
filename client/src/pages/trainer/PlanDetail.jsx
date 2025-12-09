"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, User, Calendar, Target, Utensils, Trash2, Edit, Plus, X } from "lucide-react"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import Modal from "../../components/ui/Modal"
import Input from "../../components/ui/Input"
import { trainerService } from "../../services/trainer"
import { formatDate } from "../../utils/helpers"

const PlanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    dailyCalorieTarget: "",
    dailyProteinTarget: "",
    startDate: "",
    endDate: "",
    notes: "",
    status: "active",
    workoutPlan: [],
    mealPlan: [],
  })

  useEffect(() => {
    fetchPlan()
  }, [id])

  const fetchPlan = async () => {
    try {
      const data = await trainerService.getPlanById(id)
      setPlan(data)
      setEditData({
        name: data.name || "",
        description: data.description || "",
        dailyCalorieTarget: data.dailyCalorieTarget || "",
        dailyProteinTarget: data.dailyProteinTarget || "",
        startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
        endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
        notes: data.notes || "",
        status: data.status || "active",
        workoutPlan: data.workoutPlan || [],
        mealPlan: data.mealPlan || [],
      })
    } catch (error) {
      console.error("Failed to fetch plan:", error)
      navigate("/trainer/plans")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await trainerService.updatePlan(id, {
        ...editData,
        dailyCalorieTarget: editData.dailyCalorieTarget ? Number.parseInt(editData.dailyCalorieTarget) : undefined,
        dailyProteinTarget: editData.dailyProteinTarget ? Number.parseInt(editData.dailyProteinTarget) : undefined,
      })
      setShowEditModal(false)
      await fetchPlan()
    } catch (error) {
      console.error("Failed to update plan:", error)
    } finally {
      setUpdating(false)
    }
  }

  const addWorkoutDay = () => {
    setEditData({
      ...editData,
      workoutPlan: [
        ...editData.workoutPlan,
        { day: "monday", exercises: [], isRestDay: false },
      ],
    })
  }

  const removeWorkoutDay = (index) => {
    setEditData({
      ...editData,
      workoutPlan: editData.workoutPlan.filter((_, i) => i !== index),
    })
  }

  const updateWorkoutDay = (index, field, value) => {
    const updated = [...editData.workoutPlan]
    updated[index] = { ...updated[index], [field]: value }
    setEditData({ ...editData, workoutPlan: updated })
  }

  const addExerciseToDay = (dayIndex) => {
    const updated = [...editData.workoutPlan]
    updated[dayIndex].exercises = [
      ...(updated[dayIndex].exercises || []),
      { name: "", sets: "", reps: "", weight: "", duration: "", notes: "" },
    ]
    setEditData({ ...editData, workoutPlan: updated })
  }

  const removeExerciseFromDay = (dayIndex, exerciseIndex) => {
    const updated = [...editData.workoutPlan]
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exerciseIndex)
    setEditData({ ...editData, workoutPlan: updated })
  }

  const updateExercise = (dayIndex, exerciseIndex, field, value) => {
    const updated = [...editData.workoutPlan]
    updated[dayIndex].exercises[exerciseIndex] = {
      ...updated[dayIndex].exercises[exerciseIndex],
      [field]: value,
    }
    setEditData({ ...editData, workoutPlan: updated })
  }

  const addMealDay = () => {
    setEditData({
      ...editData,
      mealPlan: [...editData.mealPlan, { day: "monday", meals: [] }],
    })
  }

  const removeMealDay = (index) => {
    setEditData({
      ...editData,
      mealPlan: editData.mealPlan.filter((_, i) => i !== index),
    })
  }

  const updateMealDay = (index, field, value) => {
    const updated = [...editData.mealPlan]
    updated[index] = { ...updated[index], [field]: value }
    setEditData({ ...editData, mealPlan: updated })
  }

  const addMealToDay = (dayIndex) => {
    const updated = [...editData.mealPlan]
    updated[dayIndex].meals = [
      ...(updated[dayIndex].meals || []),
      { type: "breakfast", description: "", targetCalories: "", suggestions: [] },
    ]
    setEditData({ ...editData, mealPlan: updated })
  }

  const removeMealFromDay = (dayIndex, mealIndex) => {
    const updated = [...editData.mealPlan]
    updated[dayIndex].meals = updated[dayIndex].meals.filter((_, i) => i !== mealIndex)
    setEditData({ ...editData, mealPlan: updated })
  }

  const updateMeal = (dayIndex, mealIndex, field, value) => {
    const updated = [...editData.mealPlan]
    updated[dayIndex].meals[mealIndex] = {
      ...updated[dayIndex].meals[mealIndex],
      [field]: value,
    }
    setEditData({ ...editData, mealPlan: updated })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await trainerService.deletePlan(id)
      navigate("/trainer/plans")
    } catch (error) {
      console.error("Failed to delete plan:", error)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      completed: "default",
      paused: "warning",
    }
    return variants[status] || "default"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/trainer/plans">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">{plan.name}</h1>
            <p className="text-muted">Training plan for {plan.client?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadge(plan.status)} className="text-sm px-3 py-1">
            {plan.status}
          </Badge>
          <Button variant="outline" onClick={handleEdit}>
            <Edit size={18} className="mr-2" />
            Edit Plan
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={18} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <Card.Header>
            <Card.Title>Client Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-medium">
                {plan.client?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-primary">{plan.client?.name}</p>
                <p className="text-sm text-muted">{plan.client?.email}</p>
              </div>
            </div>
            <Link to={`/trainer/clients/${plan.client?._id}`}>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <User size={16} className="mr-2" />
                View Client Profile
              </Button>
            </Link>
          </Card.Content>
        </Card>

        {/* Plan Details */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Plan Details</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className="text-muted" />
                  <span className="text-sm text-muted">Duration</span>
                </div>
                <p className="font-semibold text-primary">
                  {formatDate(plan.startDate)} - {plan.endDate ? formatDate(plan.endDate) : "Ongoing"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} className="text-muted" />
                  <span className="text-sm text-muted">Status</span>
                </div>
                <Badge variant={getStatusBadge(plan.status)} className="text-sm">
                  {plan.status}
                </Badge>
              </div>

              {plan.dailyCalorieTarget && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils size={18} className="text-muted" />
                    <span className="text-sm text-muted">Daily Calories</span>
                  </div>
                  <p className="font-semibold text-primary">{plan.dailyCalorieTarget} kcal</p>
                </div>
              )}

              {plan.dailyProteinTarget && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} className="text-muted" />
                    <span className="text-sm text-muted">Daily Protein</span>
                  </div>
                  <p className="font-semibold text-primary">{plan.dailyProteinTarget}g</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Description */}
      {plan.description && (
        <Card>
          <Card.Header>
            <Card.Title>Description</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted whitespace-pre-wrap">{plan.description}</p>
          </Card.Content>
        </Card>
      )}

      {/* Notes */}
      {plan.notes && (
        <Card>
          <Card.Header>
            <Card.Title>Notes</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted whitespace-pre-wrap">{plan.notes}</p>
          </Card.Content>
        </Card>
      )}

      {/* Workout Plan (if exists) */}
      {plan.workoutPlan?.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Weekly Workout Schedule</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.workoutPlan.map((day, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-primary capitalize mb-2">{day.day}</h4>
                  {day.isRestDay ? (
                    <p className="text-muted">Rest Day</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {day.exercises?.map((exercise, i) => (
                        <li key={i} className="text-muted">
                          {exercise.name}
                          {exercise.sets && exercise.reps && ` - ${exercise.sets}x${exercise.reps}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Edit Plan Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Training Plan" size="xl">
        <form onSubmit={handleUpdate} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-border rounded-lg bg-white"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Brief description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Daily Calorie Target (kcal)"
              type="number"
              value={editData.dailyCalorieTarget}
              onChange={(e) => setEditData({ ...editData, dailyCalorieTarget: e.target.value })}
            />
            <Input
              label="Daily Protein Target (g)"
              type="number"
              value={editData.dailyProteinTarget}
              onChange={(e) => setEditData({ ...editData, dailyProteinTarget: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={editData.startDate}
              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={editData.endDate}
              onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Notes</label>
            <textarea
              className="w-full px-4 py-2 border border-border rounded-lg bg-white min-h-[80px]"
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Additional notes for the client"
            />
          </div>

          {/* Workout Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-primary">Weekly Workout Plan</h3>
              <Button type="button" size="sm" onClick={addWorkoutDay}>
                <Plus size={16} className="mr-1" />
                Add Day
              </Button>
            </div>
            <div className="space-y-3">
              {editData.workoutPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      className="px-3 py-1.5 border border-border rounded-lg bg-white text-sm capitalize"
                      value={day.day}
                      onChange={(e) => updateWorkoutDay(dayIndex, "day", e.target.value)}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={day.isRestDay}
                          onChange={(e) => updateWorkoutDay(dayIndex, "isRestDay", e.target.checked)}
                        />
                        Rest Day
                      </label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeWorkoutDay(dayIndex)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  {!day.isRestDay && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addExerciseToDay(dayIndex)}
                        className="mb-2"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Exercise
                      </Button>
                      <div className="space-y-2">
                        {day.exercises?.map((exercise, exIndex) => (
                          <div key={exIndex} className="p-3 bg-white rounded border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted">Exercise {exIndex + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExerciseFromDay(dayIndex, exIndex)}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm col-span-2"
                                placeholder="Exercise name"
                                value={exercise.name}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "name", e.target.value)}
                              />
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm"
                                placeholder="Sets"
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "sets", e.target.value)}
                              />
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm"
                                placeholder="Reps"
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "reps", e.target.value)}
                              />
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm"
                                placeholder="Weight (kg)"
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "weight", e.target.value)}
                              />
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm"
                                placeholder="Duration (min)"
                                type="number"
                                value={exercise.duration}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "duration", e.target.value)}
                              />
                              <input
                                className="px-2 py-1.5 border border-border rounded text-sm col-span-2"
                                placeholder="Notes"
                                value={exercise.notes}
                                onChange={(e) => updateExercise(dayIndex, exIndex, "notes", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meal Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-primary">Weekly Meal Plan</h3>
              <Button type="button" size="sm" onClick={addMealDay}>
                <Plus size={16} className="mr-1" />
                Add Day
              </Button>
            </div>
            <div className="space-y-3">
              {editData.mealPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      className="px-3 py-1.5 border border-border rounded-lg bg-white text-sm capitalize"
                      value={day.day}
                      onChange={(e) => updateMealDay(dayIndex, "day", e.target.value)}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMealDay(dayIndex)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addMealToDay(dayIndex)}
                    className="mb-2"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Meal
                  </Button>
                  <div className="space-y-2">
                    {day.meals?.map((meal, mealIndex) => (
                      <div key={mealIndex} className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <select
                            className="px-2 py-1.5 border border-border rounded text-sm capitalize"
                            value={meal.type}
                            onChange={(e) => updateMeal(dayIndex, mealIndex, "type", e.target.value)}
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMealFromDay(dayIndex, mealIndex)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <input
                            className="w-full px-2 py-1.5 border border-border rounded text-sm"
                            placeholder="Description"
                            value={meal.description}
                            onChange={(e) => updateMeal(dayIndex, mealIndex, "description", e.target.value)}
                          />
                          <input
                            className="w-full px-2 py-1.5 border border-border rounded text-sm"
                            placeholder="Target calories"
                            type="number"
                            value={meal.targetCalories}
                            onChange={(e) => updateMeal(dayIndex, mealIndex, "targetCalories", e.target.value)}
                          />
                          <textarea
                            className="w-full px-2 py-1.5 border border-border rounded text-sm"
                            placeholder="Suggestions (one per line)"
                            rows="2"
                            value={(meal.suggestions || []).join("\n")}
                            onChange={(e) =>
                              updateMeal(
                                dayIndex,
                                mealIndex,
                                "suggestions",
                                e.target.value.split("\n").filter((s) => s.trim()),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Plan" size="sm">
        <p className="text-muted mb-6">
          Are you sure you want to delete this training plan? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PlanDetail
