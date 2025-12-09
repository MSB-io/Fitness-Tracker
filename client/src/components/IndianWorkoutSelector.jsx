import { useState } from "react"
import { Search } from "lucide-react"
import Button from "./ui/Button"

// Indian workouts database (client-side version)
const indianWorkouts = [
  // Yoga
  { name: "Surya Namaskar (10 rounds)", category: "yoga", duration: 15, caloriesBurned: 50, difficulty: "beginner" },
  { name: "Pranayama", category: "yoga", duration: 10, caloriesBurned: 15, difficulty: "beginner" },
  { name: "Kapalbhati", category: "yoga", duration: 10, caloriesBurned: 25, difficulty: "intermediate" },
  { name: "Anulom Vilom", category: "yoga", duration: 10, caloriesBurned: 12, difficulty: "beginner" },
  { name: "Tadasana", category: "yoga", duration: 5, caloriesBurned: 9, difficulty: "beginner" },
  { name: "Trikonasana", category: "yoga", duration: 5, caloriesBurned: 11, difficulty: "beginner" },
  { name: "Bhujangasana", category: "yoga", duration: 5, caloriesBurned: 10, difficulty: "beginner" },
  { name: "Vrikshasana", category: "yoga", duration: 5, caloriesBurned: 10, difficulty: "intermediate" },
  { name: "Paschimottanasana", category: "yoga", duration: 5, caloriesBurned: 9, difficulty: "beginner" },
  { name: "Sarvangasana", category: "yoga", duration: 5, caloriesBurned: 14, difficulty: "advanced" },
  { name: "Halasana", category: "yoga", duration: 5, caloriesBurned: 12, difficulty: "intermediate" },
  { name: "Dhanurasana", category: "yoga", duration: 5, caloriesBurned: 12, difficulty: "intermediate" },
  { name: "Shavasana", category: "yoga", duration: 10, caloriesBurned: 9, difficulty: "beginner" },

  // Traditional
  { name: "Dand (Indian Push-ups)", category: "traditional", sets: 3, reps: 20, caloriesBurned: 65, difficulty: "intermediate" },
  { name: "Baithak (Indian Squats)", category: "traditional", sets: 3, reps: 50, caloriesBurned: 87, difficulty: "beginner" },
  { name: "Dand Baithak Circuit", category: "traditional", sets: 3, reps: 30, caloriesBurned: 108, difficulty: "intermediate" },
  { name: "Rope Climbing", category: "traditional", duration: 10, caloriesBurned: 85, difficulty: "advanced" },

  // Cardio
  { name: "Morning Walk", category: "cardio", duration: 30, caloriesBurned: 105, difficulty: "beginner" },
  { name: "Jogging in Park", category: "cardio", duration: 30, caloriesBurned: 210, difficulty: "beginner" },
  { name: "Cycling", category: "cardio", duration: 30, caloriesBurned: 195, difficulty: "beginner" },
  { name: "Stairs Climbing", category: "cardio", duration: 15, caloriesBurned: 120, difficulty: "beginner" },

  // Sports
  { name: "Badminton", category: "sports", duration: 45, caloriesBurned: 337, difficulty: "beginner" },
  { name: "Cricket", category: "sports", duration: 60, caloriesBurned: 300, difficulty: "beginner" },
  { name: "Kabaddi", category: "sports", duration: 30, caloriesBurned: 255, difficulty: "intermediate" },

  // Dance
  { name: "Bharatanatyam", category: "dance", duration: 45, caloriesBurned: 247, difficulty: "intermediate" },
  { name: "Kathak", category: "dance", duration: 45, caloriesBurned: 234, difficulty: "intermediate" },
  { name: "Bhangra", category: "dance", duration: 30, caloriesBurned: 195, difficulty: "beginner" },
  { name: "Garba/Dandiya", category: "dance", duration: 30, caloriesBurned: 180, difficulty: "beginner" },
]

const IndianWorkoutSelector = ({ onSelectWorkout }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showSelector, setShowSelector] = useState(false)

  const categories = [
    { value: "all", label: "All" },
    { value: "yoga", label: "Yoga" },
    { value: "traditional", label: "Traditional" },
    { value: "cardio", label: "Cardio" },
    { value: "sports", label: "Sports" },
    { value: "dance", label: "Dance" },
  ]

  const filteredWorkouts = indianWorkouts.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || workout.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectWorkout = (workout) => {
    onSelectWorkout({
      name: workout.name,
      category: workout.category,
      sets: workout.sets || "",
      reps: workout.reps || "",
      duration: workout.duration || "",
      caloriesBurned: workout.caloriesBurned,
    })
    setShowSelector(false)
    setSearchTerm("")
  }

  if (!showSelector) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setShowSelector(true)}>
        <Search size={16} className="mr-1" />
        Browse Indian Workouts
      </Button>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-white mt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-primary">Select from Indian Workouts</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowSelector(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filterCategory === cat.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-primary border-border hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout, index) => (
            <div
              key={index}
              onClick={() => handleSelectWorkout(workout)}
              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-primary text-sm">{workout.name}</p>
                  <div className="flex gap-3 text-xs text-muted mt-1">
                    {workout.duration && <span>{workout.duration} min</span>}
                    {workout.sets && <span>{workout.sets} × {workout.reps}</span>}
                    <span>{workout.caloriesBurned} cal</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 capitalize">
                    {workout.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      workout.difficulty === "beginner"
                        ? "bg-green-100 text-green-700"
                        : workout.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {workout.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted">
            <p>No workouts found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndianWorkoutSelector
