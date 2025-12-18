import { useState, useEffect } from "react";
import {
  Plus,
  Target,
  Calendar,
  Trophy,
  Trash2,
  Edit2,
  Clock,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import { goalService } from "../services/goals";
import { formatDate, calculatePercentage } from "../utils/helpers";

const goalTypes = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "weight_gain", label: "Weight Gain" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "endurance", label: "Endurance" },
  { value: "strength", label: "Strength" },
  { value: "flexibility", label: "Flexibility" },
  { value: "custom", label: "Custom" },
];

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [formData, setFormData] = useState({
    type: "weight_loss",
    title: "",
    description: "",
    targetValue: "",
    currentValue: "",
    unit: "kg",
    deadline: "",
  });

  const [progressValue, setProgressValue] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalService.getAll();
      setGoals(data || []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await goalService.create({
        ...formData,
        targetValue: Number.parseFloat(formData.targetValue),
        currentValue: Number.parseFloat(formData.currentValue) || 0,
      });

      setShowModal(false);
      setFormData({
        type: "weight_loss",
        title: "",
        description: "",
        targetValue: "",
        currentValue: "",
        unit: "kg",
        deadline: "",
      });
      fetchGoals();
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;

    setSubmitting(true);
    try {
      await goalService.updateProgress(
        selectedGoal._id,
        Number.parseFloat(progressValue)
      );
      setShowProgressModal(false);
      setSelectedGoal(null);
      setProgressValue("");
      fetchGoals();
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await goalService.delete(id);
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
    } finally {
      setDeleting(null);
    }
  };

  const openProgressModal = (goal) => {
    setSelectedGoal(goal);
    setProgressValue(goal.currentValue.toString());
    setShowProgressModal(true);
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true;
    return goal.status === filter;
  });

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const getStatusBadge = (status) => {
    const variants = {
      active: "warning",
      completed: "success",
      abandoned: "danger",
    };
    return variants[status] || "default";
  };

  const getTypeColor = (type) => {
    const colors = {
      weight_loss: "bg-green-100 text-green-700",
      weight_gain: "bg-blue-100 text-blue-700",
      muscle_gain: "bg-purple-100 text-purple-700",
      endurance: "bg-orange-100 text-orange-700",
      strength: "bg-red-100 text-red-700",
      flexibility: "bg-cyan-100 text-cyan-700",
      custom: "bg-gray-100 text-gray-700",
    };
    return colors[type] || colors.custom;
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Goals</h1>
          <p className="text-muted">Set and track your fitness goals</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Active Goals</p>
            <p className="text-2xl font-bold text-primary">
              {activeGoals.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Trophy className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Completed</p>
            <p className="text-2xl font-bold text-primary">
              {completedGoals.length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Goals</p>
            <p className="text-2xl font-bold text-primary">{goals.length}</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "abandoned", label: "Abandoned" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.value
                ? "bg-primary text-white"
                : "text-muted hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const progress = calculatePercentage(
              goal.currentValue,
              goal.targetValue
            );
            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <Card key={goal._id} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                        goal.type
                      )}`}
                    >
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {goal.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                          goal.type
                        )}`}
                      >
                        {goal.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>

                {goal.description && (
                  <p className="text-sm text-muted mb-4">{goal.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Progress</span>
                    <span className="font-medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.currentValue}
                    max={goal.targetValue}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted">
                      {progress}% complete
                    </span>
                    {goal.status === "active" && (
                      <span
                        className={`text-sm ${
                          daysRemaining < 7 ? "text-red-600" : "text-muted"
                        }`}
                      >
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : "Overdue"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Calendar size={16} />
                    <span>Due: {formatDate(goal.deadline)}</span>
                  </div>
                  <div className="flex gap-2">
                    {goal.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProgressModal(goal)}
                      >
                        <Edit2 size={16} className="mr-1" />
                        Update
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal._id)}
                      disabled={deleting === goal._id}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title={filter === "all" ? "No goals yet" : `No ${filter} goals`}
          description={
            filter === "all"
              ? "Set your first fitness goal to start tracking your progress"
              : undefined
          }
          action={
            filter === "all" && (
              <Button onClick={() => setShowModal(true)}>
                <Plus size={20} className="mr-2" />
                Create Your First Goal
              </Button>
            )
          }
        />
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Goal"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Goal Type
            </label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg bg-white"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Goal Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Lose 10kg by summer"
            required
          />

          <Input
            label="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add more details about your goal"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Target Value"
              type="number"
              step="0.1"
              value={formData.targetValue}
              onChange={(e) =>
                setFormData({ ...formData, targetValue: e.target.value })
              }
              placeholder="e.g., 10"
              required
            />
            <Input
              label="Current Value"
              type="number"
              step="0.1"
              value={formData.currentValue}
              onChange={(e) =>
                setFormData({ ...formData, currentValue: e.target.value })
              }
              placeholder="e.g., 0"
            />
            <Input
              label="Unit"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              placeholder="kg, reps, min"
              required
            />
          </div>

          <Input
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
            required
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedGoal(null);
        }}
        title="Update Progress"
        size="sm"
      >
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          {selectedGoal && (
            <>
              <div className="text-center pb-4 border-b border-border">
                <h3 className="font-semibold text-primary">
                  {selectedGoal.title}
                </h3>
                <p className="text-sm text-muted">
                  Target: {selectedGoal.targetValue} {selectedGoal.unit}
                </p>
              </div>

              <Input
                label={`Current Progress (${selectedGoal.unit})`}
                type="number"
                step="0.1"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                required
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedGoal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Update
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
