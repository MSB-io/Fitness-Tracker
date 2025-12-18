import api from "./api";

export const workoutService = {
  getAll: async (params = {}) => {
    const response = await api.get("/workouts", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/workouts", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/workouts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },

  getStats: async (period = 7) => {
    const response = await api.get("/workouts/stats/summary", {
      params: { period },
    });
    return response.data;
  },
};
