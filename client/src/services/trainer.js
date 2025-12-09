import api from "./api"

export const trainerService = {
  getClients: async () => {
    const response = await api.get("/trainer/clients")
    return response.data
  },

  getClientDetail: async (clientId) => {
    const response = await api.get(`/trainer/clients/${clientId}`)
    return response.data
  },

  assignClient: async (clientId) => {
    const response = await api.post(`/trainer/clients/${clientId}/assign`)
    return response.data
  },

  getPlans: async () => {
    const response = await api.get("/trainer/plans")
    return response.data
  },

  getPlanById: async (planId) => {
    const response = await api.get(`/trainer/plans/${planId}`)
    return response.data
  },

  createPlan: async (data) => {
    const response = await api.post("/trainer/plans", data)
    return response.data
  },

  updatePlan: async (planId, data) => {
    const response = await api.put(`/trainer/plans/${planId}`, data)
    return response.data
  },

  deletePlan: async (planId) => {
    const response = await api.delete(`/trainer/plans/${planId}`)
    return response.data
  },
}
