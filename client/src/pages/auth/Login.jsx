"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"

const Login = () => {
  const { login, error } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFormError("")

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setFormError(result.error)
    }

    setLoading(false)
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-2xl text-center">Welcome Back</Card.Title>
        <Card.Description className="text-center">Sign in to your account to continue</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError || error}
            </div>
          )}

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
            placeholder="Enter your password"
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>

          <p className="text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Card.Content>
    </Card>
  )
}

export default Login
