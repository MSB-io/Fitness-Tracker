"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, ClipboardList, Users, Calendar, Trash2, ChevronRight } from "lucide-react"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Modal from "../../components/ui/Modal"
import Badge from "../../components/ui/Badge"
import EmptyState from "../../components/ui/EmptyState"
import { trainerService } from "../../services/trainer"
import { formatDate } from "../../utils/helpers"

const Plans = () => {
  const [plans, setPlans] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    dailyCalorieTarget: "",
    dailyProteinTarget: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
    workoutPlan: [],
    mealPlan: [],
  })

  const planTemplates = {
    weightLoss: {
      name: "Weight Loss Program",
      description: "A comprehensive 12-week program designed to help you lose weight through a balanced approach of cardio, strength training, and calorie-controlled nutrition.",
      dailyCalorieTarget: 1500,
      dailyProteinTarget: 120,
      notes: "Focus on maintaining a calorie deficit while preserving muscle mass. Drink plenty of water and get adequate sleep.",
      workoutPlan: [
        {
          day: "monday",
          exercises: [
            { name: "Treadmill Running", sets: 1, reps: 1, duration: 30, notes: "Warm up 5 min, then intervals" },
            { name: "Push-ups", sets: 3, reps: 15 },
            { name: "Squats", sets: 3, reps: 20 },
            { name: "Plank", sets: 3, duration: 1, notes: "Hold for 60 seconds" },
          ],
          isRestDay: false,
        },
        {
          day: "tuesday",
          exercises: [
            { name: "Cycling", sets: 1, duration: 45, notes: "Moderate intensity" },
            { name: "Lunges", sets: 3, reps: 15 },
            { name: "Mountain Climbers", sets: 3, reps: 20 },
          ],
          isRestDay: false,
        },
        {
          day: "wednesday",
          exercises: [],
          isRestDay: true,
        },
        {
          day: "thursday",
          exercises: [
            { name: "Jump Rope", sets: 3, duration: 5, notes: "Rest 1 min between sets" },
            { name: "Burpees", sets: 3, reps: 12 },
            { name: "Dumbbell Rows", sets: 3, reps: 15, weight: 10 },
            { name: "Russian Twists", sets: 3, reps: 30 },
          ],
          isRestDay: false,
        },
        {
          day: "friday",
          exercises: [
            { name: "Swimming", sets: 1, duration: 30, notes: "Continuous laps" },
            { name: "Step-ups", sets: 3, reps: 20 },
            { name: "Bicycle Crunches", sets: 3, reps: 25 },
          ],
          isRestDay: false,
        },
        {
          day: "saturday",
          exercises: [
            { name: "Brisk Walking", sets: 1, duration: 45, notes: "Outdoor preferred" },
            { name: "Yoga", sets: 1, duration: 20, notes: "Focus on flexibility" },
          ],
          isRestDay: false,
        },
        {
          day: "sunday",
          exercises: [],
          isRestDay: true,
        },
      ],
      mealPlan: [
        {
          day: "monday",
          meals: [
            {
              type: "breakfast",
              description: "High protein breakfast",
              targetCalories: 350,
              suggestions: ["Oats with protein powder and berries", "Greek yogurt with nuts", "Egg white omelette with vegetables"],
            },
            {
              type: "lunch",
              description: "Lean protein with vegetables",
              targetCalories: 450,
              suggestions: ["Grilled chicken breast with quinoa and salad", "Fish with brown rice and steamed vegetables", "Chickpea curry with roti"],
            },
            {
              type: "snack",
              description: "Light snack",
              targetCalories: 150,
              suggestions: ["Apple with almond butter", "Handful of nuts", "Protein shake"],
            },
            {
              type: "dinner",
              description: "Light protein with vegetables",
              targetCalories: 400,
              suggestions: ["Grilled fish with roasted vegetables", "Tofu stir-fry", "Chicken soup with vegetables"],
            },
          ],
        },
        {
          day: "tuesday",
          meals: [
            {
              type: "breakfast",
              targetCalories: 350,
              suggestions: ["Smoothie bowl with fruits and seeds", "Whole grain toast with avocado and eggs"],
            },
            {
              type: "lunch",
              targetCalories: 450,
              suggestions: ["Paneer tikka with salad", "Grilled chicken wrap with vegetables"],
            },
            {
              type: "snack",
              targetCalories: 150,
              suggestions: ["Roasted chickpeas", "Vegetable sticks with hummus"],
            },
            {
              type: "dinner",
              targetCalories: 400,
              suggestions: ["Baked salmon with asparagus", "Dal with vegetables and small roti"],
            },
          ],
        },
      ],
    },
    muscleGain: {
      name: "Muscle Gain Program",
      description: "An intensive 12-week program focused on building lean muscle mass through progressive overload training and high-protein nutrition.",
      dailyCalorieTarget: 2500,
      dailyProteinTarget: 180,
      notes: "Focus on progressive overload. Increase weights gradually. Ensure 7-8 hours of sleep for recovery.",
      workoutPlan: [
        {
          day: "monday",
          exercises: [
            { name: "Bench Press", sets: 4, reps: 8, weight: 60, notes: "Increase weight each set" },
            { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 20 },
            { name: "Cable Flyes", sets: 3, reps: 12, weight: 15 },
            { name: "Tricep Dips", sets: 3, reps: 12 },
            { name: "Overhead Tricep Extension", sets: 3, reps: 12, weight: 15 },
          ],
          isRestDay: false,
        },
        {
          day: "tuesday",
          exercises: [
            { name: "Deadlifts", sets: 4, reps: 6, weight: 80, notes: "Focus on form" },
            { name: "Pull-ups", sets: 4, reps: 10 },
            { name: "Barbell Rows", sets: 4, reps: 10, weight: 50 },
            { name: "Dumbbell Curls", sets: 3, reps: 12, weight: 15 },
            { name: "Hammer Curls", sets: 3, reps: 12, weight: 12 },
          ],
          isRestDay: false,
        },
        {
          day: "wednesday",
          exercises: [],
          isRestDay: true,
        },
        {
          day: "thursday",
          exercises: [
            { name: "Squats", sets: 4, reps: 8, weight: 80, notes: "Go deep" },
            { name: "Leg Press", sets: 4, reps: 12, weight: 100 },
            { name: "Romanian Deadlifts", sets: 3, reps: 10, weight: 50 },
            { name: "Leg Curls", sets: 3, reps: 15, weight: 30 },
            { name: "Calf Raises", sets: 4, reps: 20, weight: 40 },
          ],
          isRestDay: false,
        },
        {
          day: "friday",
          exercises: [
            { name: "Military Press", sets: 4, reps: 10, weight: 40 },
            { name: "Lateral Raises", sets: 3, reps: 15, weight: 10 },
            { name: "Front Raises", sets: 3, reps: 12, weight: 10 },
            { name: "Rear Delt Flyes", sets: 3, reps: 15, weight: 8 },
            { name: "Shrugs", sets: 4, reps: 15, weight: 30 },
          ],
          isRestDay: false,
        },
        {
          day: "saturday",
          exercises: [
            { name: "Full Body Circuit", sets: 3, reps: 15, notes: "Light weights, high volume" },
            { name: "Core Workout", sets: 4, duration: 5, notes: "Planks, crunches, leg raises" },
          ],
          isRestDay: false,
        },
        {
          day: "sunday",
          exercises: [],
          isRestDay: true,
        },
      ],
      mealPlan: [
        {
          day: "monday",
          meals: [
            {
              type: "breakfast",
              description: "High protein, high carb",
              targetCalories: 600,
              suggestions: ["6 egg whites with oats and banana", "Protein pancakes with peanut butter", "Poha with eggs"],
            },
            {
              type: "lunch",
              description: "Lean protein with complex carbs",
              targetCalories: 700,
              suggestions: ["Chicken breast with sweet potato and vegetables", "Fish with brown rice and dal", "Paneer with quinoa and salad"],
            },
            {
              type: "snack",
              description: "Pre-workout fuel",
              targetCalories: 300,
              suggestions: ["Protein shake with banana", "Greek yogurt with granola", "Peanut butter sandwich"],
            },
            {
              type: "dinner",
              description: "Protein-rich dinner",
              targetCalories: 650,
              suggestions: ["Grilled chicken with vegetables and rice", "Fish curry with brown rice", "Egg curry with roti"],
            },
            {
              type: "snack",
              description: "Before bed protein",
              targetCalories: 250,
              suggestions: ["Casein protein shake", "Cottage cheese with nuts", "Greek yogurt"],
            },
          ],
        },
        {
          day: "tuesday",
          meals: [
            {
              type: "breakfast",
              targetCalories: 600,
              suggestions: ["Whole grain toast with eggs and avocado", "Upma with eggs"],
            },
            {
              type: "lunch",
              targetCalories: 700,
              suggestions: ["Mutton curry with rice", "Chicken biryani (portion controlled)"],
            },
            {
              type: "snack",
              targetCalories: 300,
              suggestions: ["Trail mix with dried fruits", "Protein bar"],
            },
            {
              type: "dinner",
              targetCalories: 650,
              suggestions: ["Grilled fish with quinoa", "Chicken tikka with vegetables"],
            },
            {
              type: "snack",
              targetCalories: 250,
              suggestions: ["Milk with almonds", "Paneer cubes"],
            },
          ],
        },
      ],
    },
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansData, clientsData] = await Promise.all([trainerService.getPlans(), trainerService.getClients()])

      setPlans(plansData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templateKey) => {
    const template = planTemplates[templateKey]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 84) // 12 weeks

    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      dailyCalorieTarget: template.dailyCalorieTarget,
      dailyProteinTarget: template.dailyProteinTarget,
      endDate: endDate.toISOString().split("T")[0],
      notes: template.notes,
      workoutPlan: template.workoutPlan,
      mealPlan: template.mealPlan,
    })
    setSelectedTemplate(templateKey)
  }

  const clearTemplate = () => {
    setFormData({
      clientId: formData.clientId,
      name: "",
      description: "",
      dailyCalorieTarget: "",
      dailyProteinTarget: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      notes: "",
      workoutPlan: [],
      mealPlan: [],
    })
    setSelectedTemplate(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await trainerService.createPlan({
        ...formData,
        dailyCalorieTarget: Number.parseInt(formData.dailyCalorieTarget) || undefined,
        dailyProteinTarget: Number.parseInt(formData.dailyProteinTarget) || undefined,
      })

      setShowModal(false)
      setFormData({
        clientId: "",
        name: "",
        description: "",
        dailyCalorieTarget: "",
        dailyProteinTarget: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
        workoutPlan: [],
        mealPlan: [],
      })
      setSelectedTemplate(null)
      fetchData()
    } catch (error) {
      console.error("Failed to create plan:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await trainerService.deletePlan(id)
      fetchData()
    } catch (error) {
      console.error("Failed to delete plan:", error)
    } finally {
      setDeleting(null)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Training Plans</h1>
          <p className="text-muted">Create and manage training plans for your clients</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={clients.length === 0}>
          <Plus size={20} className="mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans List */}
      {plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan._id} className="hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <Link to={`/trainer/plans/${plan._id}`} className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{plan.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {plan.client?.name || "Unknown Client"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(plan.startDate)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadge(plan.status)}>{plan.status}</Badge>
                  {plan.dailyCalorieTarget && (
                    <span className="text-sm text-muted hidden sm:inline">{plan.dailyCalorieTarget} kcal/day</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan._id)}
                    disabled={deleting === plan._id}
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </Button>
                  <Link to={`/trainer/plans/${plan._id}`}>
                    <ChevronRight size={20} className="text-muted" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No training plans yet"
          description={
            clients.length === 0
              ? "You need clients assigned before creating plans"
              : "Create your first training plan for a client"
          }
          action={
            clients.length > 0 && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={20} className="mr-2" />
                Create Your First Plan
              </Button>
            )
          }
        />
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Training Plan" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Select Client</label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg bg-white"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Pre-built Templates */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Quick Start Templates</label>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => applyTemplate("weightLoss")}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                  selectedTemplate === "weightLoss" ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <div className="font-semibold text-primary mb-1">🔥 Weight Loss</div>
                <div className="text-xs text-muted">12-week program with cardio & nutrition</div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("muscleGain")}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                  selectedTemplate === "muscleGain" ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <div className="font-semibold text-primary mb-1">💪 Muscle Gain</div>
                <div className="text-xs text-muted">12-week strength training program</div>
              </button>
            </div>
            {selectedTemplate && (
              <button
                type="button"
                onClick={clearTemplate}
                className="text-sm text-primary hover:underline"
              >
                Clear template and start from scratch
              </button>
            )}
          </div>

          <Input
            label="Plan Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 8-Week Weight Loss Program"
            required
          />

          <Input
            label="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the plan"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Daily Calorie Target"
              type="number"
              value={formData.dailyCalorieTarget}
              onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: e.target.value })}
              placeholder="e.g., 2000"
            />
            <Input
              label="Daily Protein Target (g)"
              type="number"
              value={formData.dailyProteinTarget}
              onChange={(e) => setFormData({ ...formData, dailyProteinTarget: e.target.value })}
              placeholder="e.g., 150"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes for the client"
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Plans
