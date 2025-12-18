import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Activity,
  Ruler,
  Calendar,
  Users,
  X,
  Check,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { trainerRequestService } from "../services/trainerRequest";
import {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
} from "../utils/helpers";

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [pendingRequest, setPendingRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    profile: {
      age: user?.profile?.age || "",
      gender: user?.profile?.gender || "",
      height: user?.profile?.height || "",
      heightUnit: user?.profile?.heightUnit || "cm",
      heightFeet: user?.profile?.heightFeet || "",
      heightInches: user?.profile?.heightInches || "",
      activityLevel: user?.profile?.activityLevel || "moderate",
    },
  });

  useEffect(() => {
    if (!user?.assignedTrainer && user?.role === "user") {
      fetchPendingRequest();
    }
  }, [user]);

  const fetchPendingRequest = async () => {
    try {
      const request = await trainerRequestService.getMyRequest();
      setPendingRequest(request);
    } catch (error) {
      console.error("Failed to fetch pending request:", error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const data = await trainerRequestService.getAvailableTrainers();
      setTrainers(data);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    }
  };

  const handleRequestTrainer = async () => {
    if (!selectedTrainer) return;

    setSubmitting(true);
    try {
      await trainerRequestService.requestTrainer(
        selectedTrainer,
        requestMessage
      );
      setShowTrainerModal(false);
      setSelectedTrainer("");
      setRequestMessage("");
      fetchPendingRequest();
    } catch (error) {
      console.error("Failed to request trainer:", error);
      alert(error.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;

    try {
      await trainerRequestService.cancelRequest(pendingRequest._id);
      setPendingRequest(null);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    }
  };

  const handleRemoveTrainer = async () => {
    if (!confirm("Are you sure you want to remove your trainer?")) return;

    try {
      await trainerRequestService.removeTrainer();
      await refreshUser();
    } catch (error) {
      console.error("Failed to remove trainer:", error);
    }
  };

  const openTrainerModal = async () => {
    setShowTrainerModal(true);
    fetchTrainers();
  };

  const handleChange = (field, value) => {
    if (field === "name") {
      setFormData({ ...formData, name: value });
    } else {
      setFormData({
        ...formData,
        profile: { ...formData.profile, [field]: value },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert feet/inches to cm if using imperial
    let heightInCm = formData.profile.height;
    if (formData.profile.heightUnit === "ft") {
      const feet = Number.parseInt(formData.profile.heightFeet) || 0;
      const inches = Number.parseInt(formData.profile.heightInches) || 0;
      heightInCm = Math.round((feet * 12 + inches) * 2.54);
    }

    const result = await updateProfile({
      name: formData.name,
      profile: {
        age: Number.parseInt(formData.profile.age) || null,
        gender: formData.profile.gender || null,
        height: Number.parseInt(heightInCm) || null,
        heightUnit: formData.profile.heightUnit,
        heightFeet:
          formData.profile.heightUnit === "ft"
            ? Number.parseInt(formData.profile.heightFeet) || null
            : null,
        heightInches:
          formData.profile.heightUnit === "ft"
            ? Number.parseInt(formData.profile.heightInches) || null
            : null,
        activityLevel: formData.profile.activityLevel,
      },
    });

    if (result.success) {
      setEditing(false);
    }

    setLoading(false);
  };

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Light (1-3 days/week)" },
    { value: "moderate", label: "Moderate (3-5 days/week)" },
    { value: "active", label: "Active (6-7 days/week)" },
    { value: "very_active", label: "Very Active (hard exercise daily)" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  // Calculate BMI and daily calories based on a default weight (could be enhanced with actual weight)
  const bmi = user?.profile?.height
    ? calculateBMI(70, user.profile.height)
    : null;
  const dailyCalories = calculateDailyCalories(
    70,
    user?.profile?.height,
    user?.profile?.age,
    user?.profile?.gender,
    user?.profile?.activityLevel
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
          <p className="text-muted">Manage your account settings</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">{user?.name}</h2>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted" />
              <span className="text-muted">{user?.email}</span>
            </div>
            <Badge
              variant={user?.role === "trainer" ? "primary" : "default"}
              className="mt-1"
            >
              {user?.role === "trainer" ? "Trainer" : "User"}
            </Badge>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                value={formData.profile.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Enter your age"
              />
              <Select
                label="Gender"
                value={formData.profile.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                options={genderOptions}
                placeholder="Select gender"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Height
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleChange("heightUnit", "cm")}
                  className={`px-4 py-2 rounded-lg border ${
                    formData.profile.heightUnit === "cm"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-border"
                  }`}
                >
                  Centimeters
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("heightUnit", "ft")}
                  className={`px-4 py-2 rounded-lg border ${
                    formData.profile.heightUnit === "ft"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-border"
                  }`}
                >
                  Feet & Inches
                </button>
              </div>

              {formData.profile.heightUnit === "cm" ? (
                <Input
                  type="number"
                  value={formData.profile.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="Enter height in cm"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Feet"
                    type="number"
                    value={formData.profile.heightFeet}
                    onChange={(e) => handleChange("heightFeet", e.target.value)}
                    placeholder="e.g., 5"
                  />
                  <Input
                    label="Inches"
                    type="number"
                    value={formData.profile.heightInches}
                    onChange={(e) =>
                      handleChange("heightInches", e.target.value)
                    }
                    placeholder="e.g., 8"
                  />
                </div>
              )}
            </div>

            <Select
              label="Activity Level"
              value={formData.profile.activityLevel}
              onChange={(e) => handleChange("activityLevel", e.target.value)}
              options={activityLevels}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="text-muted" size={20} />
                <div>
                  <p className="text-sm text-muted">Age</p>
                  <p className="font-medium text-primary">
                    {user?.profile?.age
                      ? `${user.profile.age} years`
                      : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="text-muted" size={20} />
                <div>
                  <p className="text-sm text-muted">Gender</p>
                  <p className="font-medium text-primary capitalize">
                    {user?.profile?.gender || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Ruler className="text-muted" size={20} />
                <div>
                  <p className="text-sm text-muted">Height</p>
                  <p className="font-medium text-primary">
                    {user?.profile?.height
                      ? user?.profile?.heightUnit === "ft" &&
                        user?.profile?.heightFeet
                        ? `${user.profile.heightFeet}'${
                            user.profile.heightInches || 0
                          }" (${user.profile.height} cm)`
                        : `${user.profile.height} cm`
                      : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="text-muted" size={20} />
                <div>
                  <p className="text-sm text-muted">Activity Level</p>
                  <p className="font-medium text-primary capitalize">
                    {user?.profile?.activityLevel?.replace("_", " ") ||
                      "Moderate"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Calculated Metrics */}
      {(bmi || dailyCalories) && (
        <Card>
          <Card.Header>
            <Card.Title>Health Metrics</Card.Title>
            <Card.Description>
              Based on your profile information
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              {bmi && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted mb-1">BMI (estimated)</p>
                  <p className="text-2xl font-bold text-primary">{bmi}</p>
                  <Badge
                    variant={
                      getBMICategory(bmi) === "Normal" ? "success" : "warning"
                    }
                  >
                    {getBMICategory(bmi)}
                  </Badge>
                </div>
              )}
              {dailyCalories && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted mb-1">Daily Calorie Need</p>
                  <p className="text-2xl font-bold text-primary">
                    {dailyCalories}
                  </p>
                  <span className="text-sm text-muted">kcal/day</span>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Trainer Section - Only for regular users */}
      {user?.role === "user" && (
        <Card>
          <Card.Header>
            <Card.Title>Your Trainer</Card.Title>
            <Card.Description>
              Manage your personal trainer assignment
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {user?.assignedTrainer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.assignedTrainer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-primary">
                      {user.assignedTrainer.name}
                    </p>
                    <p className="text-sm text-muted">
                      {user.assignedTrainer.email}
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveTrainer}
                  className="w-full"
                >
                  Change Trainer
                </Button>
              </div>
            ) : pendingRequest ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="text-yellow-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary">
                        Request Pending
                      </p>
                      <p className="text-sm text-muted mt-1">
                        You have a pending request to{" "}
                        <strong>{pendingRequest.trainer?.name}</strong>
                      </p>
                      {pendingRequest.message && (
                        <p className="text-sm text-muted mt-2 italic">
                          "{pendingRequest.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancelRequest}
                  className="w-full"
                >
                  Cancel Request
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users size={48} className="mx-auto text-muted mb-3" />
                <p className="text-muted mb-4">You don't have a trainer yet</p>
                <Button onClick={openTrainerModal}>
                  <Users size={20} className="mr-2" />
                  Request a Trainer
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Trainer Selection Modal */}
      <Modal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        title="Request a Trainer"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Select Trainer
            </label>
            {trainers.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {trainers.map((trainer) => (
                  <div
                    key={trainer._id}
                    onClick={() => setSelectedTrainer(trainer._id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTrainer === trainer._id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {trainer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary">
                          {trainer.name}
                        </p>
                        <p className="text-sm text-muted">{trainer.email}</p>
                      </div>
                      {selectedTrainer === trainer._id && (
                        <Check className="text-primary" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-4">Loading trainers...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Message (Optional)
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself or mention your fitness goals..."
              className="w-full px-4 py-2 border border-border rounded-lg resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted mt-1">
              {requestMessage.length}/500
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTrainerModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestTrainer}
              loading={submitting}
              disabled={!selectedTrainer}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
