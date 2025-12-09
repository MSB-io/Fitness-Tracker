import { useState } from "react"
import { Search, Filter } from "lucide-react"
import Button from "./ui/Button"
import Input from "./ui/Input"

// Indian foods database (client-side version)
const indianFoods = [
  // Breakfast Items
  { name: "Idli (2 pieces)", calories: 156, protein: 4.4, carbs: 30, fat: 1.2, foodType: "vegetarian", category: "breakfast" },
  { name: "Dosa (Plain)", calories: 168, protein: 3.8, carbs: 29, fat: 3.7, foodType: "vegetarian", category: "breakfast" },
  { name: "Masala Dosa", calories: 252, protein: 6.2, carbs: 42, fat: 6.8, foodType: "vegetarian", category: "breakfast" },
  { name: "Upma", calories: 206, protein: 5.4, carbs: 36, fat: 4.2, foodType: "vegetarian", category: "breakfast" },
  { name: "Poha", calories: 180, protein: 3.2, carbs: 38, fat: 2.5, foodType: "vegetarian", category: "breakfast" },
  { name: "Paratha (Plain)", calories: 320, protein: 6, carbs: 42, fat: 14, foodType: "vegetarian", category: "breakfast" },
  { name: "Aloo Paratha", calories: 350, protein: 7, carbs: 48, fat: 16, foodType: "vegetarian", category: "breakfast" },

  // Rice & Main Dishes
  { name: "Steamed Rice (1 cup)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, foodType: "vegan", category: "main" },
  { name: "Brown Rice (1 cup)", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, foodType: "vegan", category: "main" },
  { name: "Jeera Rice", calories: 180, protein: 3.2, carbs: 32, fat: 4.5, foodType: "vegetarian", category: "main" },
  { name: "Veg Biryani", calories: 320, protein: 8, carbs: 52, fat: 10, foodType: "vegetarian", category: "main" },
  { name: "Chicken Biryani", calories: 420, protein: 25, carbs: 48, fat: 14, foodType: "non-vegetarian", category: "main" },

  // Rotis/Breads
  { name: "Roti/Chapati", calories: 71, protein: 2.7, carbs: 15.5, fat: 0.4, foodType: "vegan", category: "main" },
  { name: "Naan", calories: 262, protein: 7.6, carbs: 45, fat: 5.1, foodType: "vegetarian", category: "main" },
  { name: "Tandoori Roti", calories: 85, protein: 3.2, carbs: 18, fat: 0.5, foodType: "vegan", category: "main" },
  { name: "Phulka", calories: 68, protein: 2.5, carbs: 15, fat: 0.3, foodType: "vegan", category: "main" },

  // Dal/Lentils
  { name: "Dal Tadka", calories: 145, protein: 8.2, carbs: 22, fat: 3.5, foodType: "vegan", category: "main" },
  { name: "Dal Makhani", calories: 185, protein: 9.5, carbs: 24, fat: 6.2, foodType: "vegetarian", category: "main" },
  { name: "Sambar", calories: 118, protein: 5.8, carbs: 18.5, fat: 3.2, foodType: "vegan", category: "main" },
  { name: "Rajma", calories: 165, protein: 10.2, carbs: 26, fat: 3.8, foodType: "vegan", category: "main" },
  { name: "Chana Masala", calories: 178, protein: 9.8, carbs: 28, fat: 4.2, foodType: "vegan", category: "main" },

  // Vegetables
  { name: "Aloo Gobi", calories: 142, protein: 3.2, carbs: 22, fat: 5.5, foodType: "vegan", category: "main" },
  { name: "Palak Paneer", calories: 195, protein: 11.5, carbs: 12, fat: 13.2, foodType: "vegetarian", category: "main" },
  { name: "Paneer Butter Masala", calories: 285, protein: 14.5, carbs: 15, fat: 20, foodType: "vegetarian", category: "main" },
  { name: "Mixed Veg Curry", calories: 125, protein: 3.8, carbs: 18, fat: 4.5, foodType: "vegan", category: "main" },
  { name: "Baingan Bharta", calories: 132, protein: 2.8, carbs: 16, fat: 6.8, foodType: "vegan", category: "main" },
  { name: "Bhindi Masala", calories: 118, protein: 2.5, carbs: 14, fat: 6.2, foodType: "vegan", category: "main" },

  // Snacks
  { name: "Samosa (1 pc)", calories: 262, protein: 4.8, carbs: 35, fat: 12, foodType: "vegetarian", category: "snack" },
  { name: "Pakora (100g)", calories: 285, protein: 6.5, carbs: 32, fat: 14.5, foodType: "vegetarian", category: "snack" },
  { name: "Dhokla", calories: 160, protein: 4.2, carbs: 28, fat: 3.8, foodType: "vegetarian", category: "snack" },
  { name: "Kachori (1 pc)", calories: 190, protein: 3.8, carbs: 25, fat: 8.5, foodType: "vegetarian", category: "snack" },
  { name: "Vada Pav", calories: 286, protein: 5.5, carbs: 42, fat: 10.5, foodType: "vegetarian", category: "snack" },

  // Dairy
  { name: "Paneer (100g)", calories: 265, protein: 18.3, carbs: 3.6, fat: 20.8, foodType: "vegetarian", category: "protein" },
  { name: "Curd/Dahi (1 bowl)", calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, foodType: "vegetarian", category: "dairy" },
  { name: "Lassi (Sweet)", calories: 95, protein: 2.8, carbs: 14.5, fat: 3.2, foodType: "vegetarian", category: "beverage" },
  { name: "Buttermilk", calories: 40, protein: 2.2, carbs: 5, fat: 0.9, foodType: "vegetarian", category: "beverage" },

  // Beverages
  { name: "Chai (1 cup)", calories: 60, protein: 1.2, carbs: 10.5, fat: 1.5, foodType: "vegetarian", category: "beverage" },
  { name: "Filter Coffee", calories: 50, protein: 1, carbs: 8, fat: 1.5, foodType: "vegetarian", category: "beverage" },

  // Non-Vegetarian
  { name: "Chicken Curry", calories: 215, protein: 22.5, carbs: 8.5, fat: 11.2, foodType: "non-vegetarian", category: "main" },
  { name: "Butter Chicken", calories: 285, protein: 24, carbs: 12, fat: 18, foodType: "non-vegetarian", category: "main" },
  { name: "Tandoori Chicken", calories: 195, protein: 28, carbs: 4, fat: 8, foodType: "non-vegetarian", category: "main" },
  { name: "Fish Curry", calories: 165, protein: 20.5, carbs: 6.5, fat: 7.2, foodType: "non-vegetarian", category: "main" },
  { name: "Egg Curry (2 eggs)", calories: 225, protein: 14.5, carbs: 8.5, fat: 16, foodType: "non-vegetarian", category: "main" },
  { name: "Boiled Egg (1)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, foodType: "non-vegetarian", category: "protein" },
]

const IndianFoodSelector = ({ onSelectFood, currentMealType = "breakfast" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showSelector, setShowSelector] = useState(false)

  const filteredFoods = indianFoods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || food.foodType === filterType
    const matchesCategory = currentMealType === "snack" || currentMealType === "evening-snack" 
      ? food.category === "snack" || food.category === "main"
      : food.category === currentMealType || food.category === "main"
    
    return matchesSearch && matchesType && matchesCategory
  })

  const handleSelectFood = (food) => {
    onSelectFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      foodType: food.foodType,
      quantity: 1,
    })
    setShowSelector(false)
    setSearchTerm("")
  }

  if (!showSelector) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setShowSelector(true)}>
        <Search size={16} className="mr-1" />
        Browse Indian Foods
      </Button>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-primary">Select from Indian Foods</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowSelector(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-3 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "vegetarian", "vegan", "non-vegetarian"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filterType === type
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-primary border-border hover:bg-gray-50"
              }`}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food, index) => (
            <div
              key={index}
              onClick={() => handleSelectFood(food)}
              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary text-sm">{food.name}</p>
                  <div className="flex gap-3 text-xs text-muted mt-1">
                    <span>{food.calories} cal</span>
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    food.foodType === "vegan"
                      ? "bg-green-100 text-green-700"
                      : food.foodType === "vegetarian"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {food.foodType === "non-vegetarian" ? "Non-Veg" : food.foodType.charAt(0).toUpperCase() + food.foodType.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted">
            <p>No foods found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndianFoodSelector
