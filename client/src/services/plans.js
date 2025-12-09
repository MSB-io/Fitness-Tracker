import api from "./api"

export const plansService = {
  // User-side: Get all plans assigned to user
  getMyPlans: async () => {
    const response = await api.get("/auth/my-plans")
    return response.data
  },

  // User-side: Get single plan details
  getMyPlanById: async (planId) => {
    const response = await api.get(`/auth/my-plans/${planId}`)
    return response.data
  },
}
