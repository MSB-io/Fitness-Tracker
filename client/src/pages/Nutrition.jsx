"use client"

import { useState, useEffect } from "react"
import { Plus, Utensils, Trash2, Coffee, Sun, Moon, Cookie, Flame } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Modal from "../components/ui/Modal"
import EmptyState from "../components/ui/EmptyState"
import ProgressBar from "../components/ui/ProgressBar"
import IndianFoodSelector from "../components/IndianFoodSelector"
import { mealService } from "../services/meals"
import { formatDate, formatNumber } from "../utils/helpers"

const mealTypes = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "snack", label: "Snack", icon: Cookie },
  { value: "evening-snack", label: "Evening Snack", icon: Cookie },
]

const foodTypes = [
  { value: "all", label: "All Foods" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
]

const Nutrition = () => {
  const [meals, setMeals] = useState([])
  const [todayMeals, setTodayMeals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [weeklyStats, setWeeklyStats] = useState([])
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    type: "breakfast",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    foods: [{ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: 1 }],
  })

  // Daily targets (adjusted for typical Indian diet - higher carbs, moderate protein)
  const targets = {
    calories: 2000,
    protein: 100, // Adjusted for vegetarian-heavy Indian diet
    carbs: 300, // Higher for rice/roti-based diet
    fat: 55,
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [mealsResponse, todayResponse, statsResponse] = await Promise.all([
        mealService.getAll({ limit: 20 }),
        mealService.getToday(),
        mealService.getStats(7),
      ])

      setMeals(mealsResponse.meals || [])
      setTodayMeals(todayResponse)
      setWeeklyStats(statsResponse || [])
    } catch (error) {
      console.error("Failed to fetch nutrition data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = () => {
    setFormData({
      ...formData,
      foods: [...formData.foods, { name: "", calories: "", protein: "", carbs: "", fat: "", quantity: 1 }],
    })
  }

  const handleRemoveFood = (index) => {
    if (formData.foods.length > 1) {
      setFormData({
        ...formData,
        foods: formData.foods.filter((_, i) => i !== index),
      })
    }
  }

  const handleFoodChange = (index, field, value) => {
    const newFoods = [...formData.foods]
    newFoods[index][field] = value
    setFormData({ ...formData, foods: newFoods })
  }

  const handleSelectIndianFood = (food) => {
    // Replace the last empty food item or add a new one
    const lastFood = formData.foods[formData.foods.length - 1]
    if (lastFood.name === "" && lastFood.calories === "") {
      const newFoods = [...formData.foods]
      newFoods[newFoods.length - 1] = food
      setFormData({ ...formData, foods: newFoods })
    } else {
      setFormData({ ...formData, foods: [...formData.foods, food] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        type: formData.type,
        date: formData.date,
        notes: formData.notes,
        foods: formData.foods.map((food) => ({
          name: food.name,
          calories: Number.parseInt(food.calories) || 0,
          protein: Number.parseFloat(food.protein) || 0,
          carbs: Number.parseFloat(food.carbs) || 0,
          fat: Number.parseFloat(food.fat) || 0,
          quantity: Number.parseInt(food.quantity) || 1,
        })),
      }

      await mealService.create(payload)
      setShowModal(false)
      setFormData({
        type: "breakfast",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        foods: [{ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: 1 }],
      })
      fetchData()
    } catch (error) {
      console.error("Failed to create meal:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await mealService.delete(id)
      fetchData()
    } catch (error) {
      console.error("Failed to delete meal:", error)
    } finally {
      setDeleting(null)
    }
  }

  const getMealIcon = (type) => {
    const meal = mealTypes.find((m) => m.value === type)
    return meal?.icon || Utensils
  }

  const getMealColor = (type) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-700",
      lunch: "bg-orange-100 text-orange-700",
      dinner: "bg-blue-100 text-blue-700",
      snack: "bg-green-100 text-green-700",
    }
    return colors[type] || "bg-gray-100 text-gray-700"
  }

  // Prepare macro pie chart data
  const macroData = todayMeals?.totals
    ? [
        { name: "Protein", value: todayMeals.totals.protein, color: "#3b82f6" },
        { name: "Carbs", value: todayMeals.totals.carbs, color: "#22c55e" },
        { name: "Fat", value: todayMeals.totals.fat, color: "#f59e0b" },
      ]
    : []

  // Prepare weekly chart data
  const chartData = weeklyStats.map((day) => ({
    date: day._id.slice(-5),
    calories: day.dailyCalories,
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
          <h1 className="text-2xl font-bold text-primary">Nutrition</h1>
          <p className="text-muted">Track your meals and macros</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Log Meal
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Progress */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Today's Progress</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Calories</span>
                    <span className="font-medium">
                      {todayMeals?.totals?.calories || 0} / {targets.calories} kcal
                    </span>
                  </div>
                  <ProgressBar value={todayMeals?.totals?.calories || 0} max={targets.calories} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Protein</span>
                    <span className="font-medium">
                      {todayMeals?.totals?.protein || 0} / {targets.protein} g
                    </span>
                  </div>
                  <ProgressBar value={todayMeals?.totals?.protein || 0} max={targets.protein} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Carbs</span>
                    <span className="font-medium">
                      {todayMeals?.totals?.carbs || 0} / {targets.carbs} g
                    </span>
                  </div>
                  <ProgressBar value={todayMeals?.totals?.carbs || 0} max={targets.carbs} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Fat</span>
                    <span className="font-medium">
                      {todayMeals?.totals?.fat || 0} / {targets.fat} g
                    </span>
                  </div>
                  <ProgressBar value={todayMeals?.totals?.fat || 0} max={targets.fat} />
                </div>
              </div>

              {/* Macro Distribution Pie Chart */}
              <div className="flex flex-col items-center justify-center">
                {macroData.some((d) => d.value > 0) ? (
                  <>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={macroData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                            {macroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-2">
                      {macroData.map((macro) => (
                        <div key={macro.name} className="flex items-center gap-1 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
                          <span>{macro.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted">
                    <Utensils size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No meals logged today</p>
                  </div>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card>
          <Card.Header>
            <Card.Title>Calorie Balance</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-center py-4">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Flame size={40} className="text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-primary">{formatNumber(todayMeals?.totals?.calories || 0)}</p>
              <p className="text-muted">kcal consumed today</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted">
                  {targets.calories - (todayMeals?.totals?.calories || 0) > 0
                    ? `${targets.calories - (todayMeals?.totals?.calories || 0)} kcal remaining`
                    : `${(todayMeals?.totals?.calories || 0) - targets.calories} kcal over target`}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Weekly Calorie Chart */}
      {chartData.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Weekly Calorie Intake</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Bar dataKey="calories" fill="#000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Today's Meals */}
      <Card>
        <Card.Header>
          <Card.Title>Today's Meals</Card.Title>
        </Card.Header>
        <Card.Content>
          {todayMeals?.meals?.length > 0 ? (
            <div className="space-y-3">
              {todayMeals.meals.map((meal) => {
                const Icon = getMealIcon(meal.type)
                return (
                  <div key={meal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMealColor(meal.type)}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary capitalize">{meal.type}</p>
                        <p className="text-sm text-muted">
                          {meal.foods
                            .map((f) => f.name)
                            .join(", ")
                            .slice(0, 50)}
                          {meal.foods.map((f) => f.name).join(", ").length > 50 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-medium text-primary">{meal.totalCalories} kcal</p>
                        <p className="text-sm text-muted">
                          P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFat}g
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meal._id)}
                        disabled={deleting === meal._id}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Utensils}
              title="No meals logged today"
              description="Start tracking your nutrition by logging your first meal"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus size={20} className="mr-2" />
                  Log Your First Meal
                </Button>
              }
            />
          )}
        </Card.Content>
      </Card>

      {/* Recent Meals */}
      {meals.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Recent Meals</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {meals.slice(0, 10).map((meal) => {
                const Icon = getMealIcon(meal.type)
                return (
                  <div key={meal._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMealColor(meal.type)}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-primary capitalize">{meal.type}</p>
                        <p className="text-sm text-muted">{formatDate(meal.date)}</p>
                      </div>
                    </div>
                    <p className="font-medium text-primary">{meal.totalCalories} kcal</p>
                  </div>
                )
              })}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Add Meal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Meal" size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Meal Type</label>
              <select
                className="w-full px-4 py-2 border border-border rounded-lg bg-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {mealTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Foods */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-primary">Food Items</label>
              <div className="flex gap-2">
                <IndianFoodSelector 
                  onSelectFood={handleSelectIndianFood} 
                  currentMealType={formData.type}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddFood}>
                  <Plus size={16} className="mr-1" />
                  Add Custom
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.foods.map((food, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">Food {index + 1}</span>
                    {formData.foods.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFood(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Food name"
                      value={food.name}
                      onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                      className="col-span-2 sm:col-span-1"
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={food.calories}
                      onChange={(e) => handleFoodChange(index, "calories", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={food.quantity}
                      onChange={(e) => handleFoodChange(index, "quantity", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Protein (g)"
                      value={food.protein}
                      onChange={(e) => handleFoodChange(index, "protein", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Carbs (g)"
                      value={food.carbs}
                      onChange={(e) => handleFoodChange(index, "carbs", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Fat (g)"
                      value={food.fat}
                      onChange={(e) => handleFoodChange(index, "fat", e.target.value)}
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
            placeholder="Any additional notes..."
          />

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Meal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Nutrition
