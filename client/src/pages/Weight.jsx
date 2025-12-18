import { useState, useEffect } from "react";
import {
  Plus,
  Scale,
  TrendingUp,
  TrendingDown,
  Trash2,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { weightService } from "../services/weight";
import { formatDate, calculateBMI, getBMICategory } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const Weight = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsData, progressData] = await Promise.all([
        weightService.getAll(60),
        weightService.getProgress(),
      ]);

      setLogs(logsData || []);
      setProgress(progressData);
    } catch (error) {
      console.error("Failed to fetch weight data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await weightService.create({
        weight: Number.parseFloat(formData.weight),
        bodyFat: formData.bodyFat
          ? Number.parseFloat(formData.bodyFat)
          : undefined,
        muscleMass: formData.muscleMass
          ? Number.parseFloat(formData.muscleMass)
          : undefined,
        notes: formData.notes,
        date: formData.date,
      });

      setShowModal(false);
      setFormData({
        weight: "",
        bodyFat: "",
        muscleMass: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create weight log:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await weightService.delete(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete weight log:", error);
    } finally {
      setDeleting(null);
    }
  };

  // Prepare chart data (already sorted oldest to newest from server)
  const chartData =
    progress?.history?.map((log) => ({
      date: formatDate(log.date, { month: "short", day: "numeric" }),
      weight: log.weight,
      bodyFat: log.bodyFat,
    })) || [];

  // Calculate current BMI
  const currentWeight = progress?.currentWeight;
  const height = user?.profile?.height;
  const bmi =
    currentWeight && height ? calculateBMI(currentWeight, height) : null;

  // Calculate target weight for normal BMI (if overweight)
  const targetWeight = height
    ? Math.round(24.9 * Math.pow(height / 100, 2))
    : null;

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
          <h1 className="text-2xl font-bold text-primary">Weight Tracking</h1>
          <p className="text-muted">Monitor your weight progress over time</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Log Weight
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scale className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Current Weight</p>
            <p className="text-2xl font-bold text-primary">
              {progress?.currentWeight ? `${progress.currentWeight} kg` : "N/A"}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              progress?.change < 0
                ? "bg-green-100"
                : progress?.change > 0
                ? "bg-red-100"
                : "bg-gray-100"
            }`}
          >
            {progress?.change < 0 ? (
              <TrendingDown className="text-green-600" size={24} />
            ) : (
              <TrendingUp
                className={
                  progress?.change > 0 ? "text-red-600" : "text-gray-600"
                }
                size={24}
              />
            )}
          </div>
          <div>
            <p className="text-sm text-muted">Total Change</p>
            <p className="text-2xl font-bold text-primary">
              {progress?.change !== undefined
                ? `${progress.change > 0 ? "+" : ""}${progress.change.toFixed(
                    1
                  )} kg`
                : "N/A"}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">BMI</p>
            <div>
              <p className="text-2xl font-bold text-primary">{bmi || "N/A"}</p>
              {bmi && (
                <p className="text-xs text-muted">{getBMICategory(bmi)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Scale className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Starting Weight</p>
            <p className="text-2xl font-bold text-primary">
              {progress?.startWeight ? `${progress.startWeight} kg` : "N/A"}
            </p>
          </div>
        </Card>
      </div>

      {/* Weight Progress Chart */}
      <Card>
        <Card.Header>
          <Card.Title>Weight Progress</Card.Title>
          <Card.Description>Your weight trend over time</Card.Description>
        </Card.Header>
        <Card.Content>
          {chartData.length > 1 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#737373"
                  />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{ fontSize: 12 }}
                    stroke="#737373"
                    unit=" kg"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                    }}
                  />
                  {targetWeight && (
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      label={{
                        value: `Target: ${targetWeight}kg`,
                        fill: "#22c55e",
                        fontSize: 12,
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#000"
                    strokeWidth={2}
                    dot={{ fill: "#000", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted">
              <div className="text-center">
                <Scale size={48} className="mx-auto mb-4 opacity-50" />
                <p>Log at least 2 weight entries to see your progress chart</p>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Weight History */}
      <Card>
        <Card.Header>
          <Card.Title>Weight History</Card.Title>
        </Card.Header>
        <Card.Content>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const prevLog = logs[index + 1];
                const change = prevLog ? log.weight - prevLog.weight : 0;

                return (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Scale className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">
                          {log.weight} kg
                        </p>
                        <p className="text-sm text-muted">
                          {formatDate(log.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {change !== 0 && (
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${
                            change < 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {change < 0 ? (
                            <TrendingDown size={16} />
                          ) : (
                            <TrendingUp size={16} />
                          )}
                          {Math.abs(change).toFixed(1)} kg
                        </span>
                      )}
                      {log.bodyFat && (
                        <span className="text-sm text-muted hidden sm:inline">
                          {log.bodyFat}% BF
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(log._id)}
                        disabled={deleting === log._id}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Scale}
              title="No weight entries yet"
              description="Start tracking your weight to monitor your progress"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus size={20} className="mr-2" />
                  Log Your First Weight
                </Button>
              }
            />
          )}
        </Card.Content>
      </Card>

      {/* Add Weight Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Weight"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            placeholder="e.g., 75.5"
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Body Fat % (optional)"
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) =>
              setFormData({ ...formData, bodyFat: e.target.value })
            }
            placeholder="e.g., 20.5"
          />

          <Input
            label="Muscle Mass kg (optional)"
            type="number"
            step="0.1"
            value={formData.muscleMass}
            onChange={(e) =>
              setFormData({ ...formData, muscleMass: e.target.value })
            }
            placeholder="e.g., 35.0"
          />

          <Input
            label="Notes (optional)"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes..."
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
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Weight;
