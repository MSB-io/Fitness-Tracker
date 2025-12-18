import api from "./api";

export const reportService = {
  getSummary: async (startDate, endDate) => {
    const response = await api.get("/reports/summary", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getWeekly: async (weeks = 4) => {
    const response = await api.get("/reports/weekly", { params: { weeks } });
    return response.data;
  },

  getDailyCalories: async (days = 14) => {
    const response = await api.get("/reports/daily-calories", {
      params: { days },
    });
    return response.data;
  },
};
