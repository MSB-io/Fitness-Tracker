import api from "./api";

export const weightService = {
  getAll: async (limit = 30) => {
    const response = await api.get("/weight", { params: { limit } });
    return response.data;
  },

  getLatest: async () => {
    const response = await api.get("/weight/latest");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/weight", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/weight/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/weight/${id}`);
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get("/weight/stats/progress");
    return response.data;
  },
};
