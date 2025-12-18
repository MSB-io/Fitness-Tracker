import api from "./api";

export const mealService = {
  getAll: async (params = {}) => {
    const response = await api.get("/meals", { params });
    return response.data;
  },

  getToday: async () => {
    const response = await api.get("/meals/today");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/meals", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/meals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },

  getStats: async (period = 7) => {
    const response = await api.get("/meals/stats/summary", {
      params: { period },
    });
    return response.data;
  },
};
