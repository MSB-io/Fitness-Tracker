import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Flame, Dumbbell } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { workoutService } from "../services/workouts";
import { formatDate } from "../utils/helpers";

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const data = await workoutService.getById(id);
      setWorkout(data);
    } catch (error) {
      console.error("Failed to fetch workout:", error);
      navigate("/workouts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await workoutService.delete(id);
      navigate("/workouts");
    } catch (error) {
      console.error("Failed to delete workout:", error);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      cardio: "bg-red-100 text-red-800",
      strength: "bg-blue-100 text-blue-800",
      flexibility: "bg-green-100 text-green-800",
      balance: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">{workout.name}</h1>
            <p className="text-muted">{formatDate(workout.date)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={18} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Exercises</p>
            <p className="text-xl font-bold text-primary">
              {workout.exercises?.length || 0}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Duration</p>
            <p className="text-xl font-bold text-primary">
              {workout.totalDuration} min
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Flame className="text-orange-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-muted">Calories Burned</p>
            <p className="text-xl font-bold text-primary">
              {workout.totalCaloriesBurned} kcal
            </p>
          </div>
        </Card>
      </div>

      {/* Exercises List */}
      <Card>
        <Card.Header>
          <Card.Title>Exercises</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {workout.exercises?.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">
                      {exercise.name}
                    </h4>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${getCategoryColor(
                        exercise.category
                      )}`}
                    >
                      {exercise.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  {exercise.sets > 0 && (
                    <div className="text-center">
                      <p className="font-medium text-primary">
                        {exercise.sets}
                      </p>
                      <p className="text-muted">sets</p>
                    </div>
                  )}
                  {exercise.reps > 0 && (
                    <div className="text-center">
                      <p className="font-medium text-primary">
                        {exercise.reps}
                      </p>
                      <p className="text-muted">reps</p>
                    </div>
                  )}
                  {exercise.weight > 0 && (
                    <div className="text-center">
                      <p className="font-medium text-primary">
                        {exercise.weight}
                      </p>
                      <p className="text-muted">kg</p>
                    </div>
                  )}
                  {exercise.caloriesBurned > 0 && (
                    <div className="text-center">
                      <p className="font-medium text-primary">
                        {exercise.caloriesBurned}
                      </p>
                      <p className="text-muted">kcal</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Notes */}
      {workout.notes && (
        <Card>
          <Card.Header>
            <Card.Title>Notes</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted whitespace-pre-wrap">{workout.notes}</p>
          </Card.Content>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workout"
        size="sm"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete this workout? This action cannot be
          undone.
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
  );
};

export default WorkoutDetail;
