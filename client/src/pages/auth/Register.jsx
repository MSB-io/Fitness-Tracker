import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";

const Register = () => {
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (!result.success) {
      setFormError(result.error);
    }

    setLoading(false);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-2xl text-center">Create Account</Card.Title>
        <Card.Description className="text-center">
          Start your fitness journey today
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError || error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />

          <Select
            label="Account Type"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: "user", label: "Regular User" },
              { value: "trainer", label: "Trainer" },
            ]}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Card.Content>
    </Card>
  );
};

export default Register;
