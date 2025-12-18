import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Calendar,
  Target,
  Utensils,
  User,
  Dumbbell,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { plansService } from "../services/plans";
import { formatDate } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const MyPlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await plansService.getMyPlans();
      setPlans(data || []);
      // Auto-select the most recent active plan
      const activePlan = data?.find((p) => p.status === "active");
      if (activePlan) {
        setSelectedPlan(activePlan);
      } else if (data?.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      completed: "default",
      paused: "warning",
    };
    return variants[status] || "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Training Plan</h1>
          <p className="text-muted">
            View your personalized training and nutrition plans
          </p>
        </div>
        <EmptyState
          icon={ClipboardList}
          title="No training plans yet"
          description={
            user?.assignedTrainer
              ? "Your trainer hasn't created a plan for you yet. Contact your trainer to get started."
              : "You don't have a trainer assigned yet. Select a trainer from your profile to receive personalized training plans."
          }
          action={
            !user?.assignedTrainer && (
              <Link to="/profile">
                <Button>
                  <User size={20} className="mr-2" />
                  Select a Trainer
                </Button>
              </Link>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">My Training Plan</h1>
        <p className="text-muted">
          View your personalized training and nutrition plans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>Your Plans ({plans.length})</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPlan?._id === plan._id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-primary text-sm">
                        {plan.name}
                      </h4>
                      <Badge
                        variant={getStatusBadge(plan.status)}
                        className="text-xs"
                      >
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(plan.startDate)}
                      {plan.endDate && ` - ${formatDate(plan.endDate)}`}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Trainer Info */}
          {selectedPlan?.trainer && (
            <Card>
              <Card.Header>
                <Card.Title>Your Trainer</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-medium">
                    {selectedPlan.trainer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      {selectedPlan.trainer.name}
                    </p>
                    <p className="text-sm text-muted">
                      {selectedPlan.trainer.email}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* Plan Details */}
        {selectedPlan && (
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title>{selectedPlan.name}</Card.Title>
                    <Card.Description>
                      Created by {selectedPlan.trainer?.name}
                    </Card.Description>
                  </div>
                  <Badge
                    variant={getStatusBadge(selectedPlan.status)}
                    className="text-sm px-3 py-1"
                  >
                    {selectedPlan.status}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted">Start Date</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatDate(selectedPlan.startDate)}
                      </p>
                    </div>
                  </div>
                  {selectedPlan.endDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted">End Date</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatDate(selectedPlan.endDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPlan.dailyCalorieTarget && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted">Daily Calories</p>
                        <p className="text-sm font-semibold text-primary">
                          {selectedPlan.dailyCalorieTarget} kcal
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPlan.dailyProteinTarget && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Utensils className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted">Daily Protein</p>
                        <p className="text-sm font-semibold text-primary">
                          {selectedPlan.dailyProteinTarget}g
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Description */}
            {selectedPlan.description && (
              <Card>
                <Card.Header>
                  <Card.Title>Plan Description</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-muted whitespace-pre-wrap">
                    {selectedPlan.description}
                  </p>
                </Card.Content>
              </Card>
            )}

            {/* Notes from Trainer */}
            {selectedPlan.notes && (
              <Card>
                <Card.Header>
                  <Card.Title>Trainer's Notes</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-muted whitespace-pre-wrap">
                    {selectedPlan.notes}
                  </p>
                </Card.Content>
              </Card>
            )}

            {/* Workout Plan */}
            {selectedPlan.workoutPlan?.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Weekly Workout Schedule</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.workoutPlan.map((day, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Dumbbell size={18} className="text-primary" />
                          <h4 className="font-semibold text-primary capitalize">
                            {day.day}
                          </h4>
                        </div>
                        {day.isRestDay ? (
                          <p className="text-sm text-muted italic">Rest Day</p>
                        ) : (
                          <div className="space-y-2">
                            {day.exercises?.map((exercise, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="font-medium text-primary">
                                  {exercise.name}
                                </p>
                                <div className="text-xs text-muted flex flex-wrap gap-2 mt-1">
                                  {exercise.sets && (
                                    <span>{exercise.sets} sets</span>
                                  )}
                                  {exercise.reps && (
                                    <span>× {exercise.reps} reps</span>
                                  )}
                                  {exercise.weight && (
                                    <span>@ {exercise.weight}kg</span>
                                  )}
                                  {exercise.duration && (
                                    <span>{exercise.duration} min</span>
                                  )}
                                </div>
                                {exercise.notes && (
                                  <p className="text-xs text-muted mt-1 italic">
                                    {exercise.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Meal Plan */}
            {selectedPlan.mealPlan?.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Weekly Meal Plan</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {selectedPlan.mealPlan.map((day, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Utensils size={18} className="text-primary" />
                          <h4 className="font-semibold text-primary capitalize">
                            {day.day}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {day.meals?.map((meal, idx) => (
                            <div
                              key={idx}
                              className="pl-3 border-l-2 border-primary/30"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-primary capitalize text-sm">
                                  {meal.type}
                                </p>
                                {meal.targetCalories && (
                                  <span className="text-xs text-muted">
                                    {meal.targetCalories} kcal
                                  </span>
                                )}
                              </div>
                              {meal.description && (
                                <p className="text-sm text-muted mb-1">
                                  {meal.description}
                                </p>
                              )}
                              {meal.suggestions?.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-muted/80 mb-1">
                                    Suggestions:
                                  </p>
                                  <ul className="text-xs text-muted list-disc list-inside space-y-0.5">
                                    {meal.suggestions.map(
                                      (suggestion, sIdx) => (
                                        <li key={sIdx}>{suggestion}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* No workout or meal plan */}
            {!selectedPlan.workoutPlan?.length &&
              !selectedPlan.mealPlan?.length && (
                <Card>
                  <Card.Content>
                    <div className="text-center py-8 text-muted">
                      <ClipboardList
                        size={40}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p>No detailed workout or meal plans added yet</p>
                      <p className="text-sm mt-1">
                        Contact your trainer for detailed plans
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlan;
