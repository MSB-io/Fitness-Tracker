"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, ClipboardList, Activity, ChevronRight } from "lucide-react"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import { useAuth } from "../../context/AuthContext"
import { trainerService } from "../../services/trainer"

const TrainerDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [plans, setPlans] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsData, plansData] = await Promise.all([trainerService.getClients(), trainerService.getPlans()])

      setClients(clientsData || [])
      setPlans(plansData || [])
    } catch (error) {
      console.error("Failed to fetch trainer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const activePlans = plans.filter((p) => p.status === "active")

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
      <div>
        <h1 className="text-2xl font-bold text-primary">Trainer Dashboard</h1>
        <p className="text-muted">Manage your clients and training plans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Clients</p>
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Active Plans</p>
            <p className="text-2xl font-bold text-primary">{activePlans.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Total Plans</p>
            <p className="text-2xl font-bold text-primary">{plans.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Activity className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted">Welcome</p>
            <p className="text-lg font-bold text-primary">{user?.name?.split(" ")[0]}</p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Your Clients</Card.Title>
              <Link to="/trainer/clients">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {clients.length > 0 ? (
              <div className="space-y-3">
                {clients.slice(0, 5).map((client) => (
                  <Link
                    key={client._id}
                    to={`/trainer/clients/${client._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                        {client.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{client.name}</p>
                        <p className="text-sm text-muted">{client.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <Users size={40} className="mx-auto mb-2 opacity-50" />
                <p>No clients assigned yet</p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Active Plans */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Active Plans</Card.Title>
              <Link to="/trainer/plans">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {activePlans.length > 0 ? (
              <div className="space-y-3">
                {activePlans.slice(0, 5).map((plan) => (
                  <Link
                    key={plan._id}
                    to={`/trainer/plans/${plan._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{plan.name}</p>
                        <p className="text-sm text-muted">For: {plan.client?.name || "Unknown"}</p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
                <p>No active plans</p>
                <Link to="/trainer/plans">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Create Plan
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            <Link to="/trainer/clients">
              <Button variant="outline">
                <Users size={18} className="mr-2" />
                View All Clients
              </Button>
            </Link>
            <Link to="/trainer/plans">
              <Button>
                <ClipboardList size={18} className="mr-2" />
                Create New Plan
              </Button>
            </Link>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default TrainerDashboard
