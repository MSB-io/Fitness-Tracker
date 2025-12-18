import api from "./api";

export const trainerRequestService = {
  // User-side: Get all available trainers
  getAvailableTrainers: async () => {
    const response = await api.get("/auth/trainers");
    return response.data;
  },

  // User-side: Request a trainer
  requestTrainer: async (trainerId, message) => {
    const response = await api.post("/auth/trainer-request", {
      trainerId,
      message,
    });
    return response.data;
  },

  // User-side: Get user's current pending request
  getMyRequest: async () => {
    const response = await api.get("/auth/trainer-request/my-request");
    return response.data;
  },

  // User-side: Cancel pending request
  cancelRequest: async (requestId) => {
    const response = await api.delete(`/auth/trainer-request/${requestId}`);
    return response.data;
  },

  // User-side: Remove assigned trainer
  removeTrainer: async () => {
    const response = await api.delete("/auth/profile/trainer");
    return response.data;
  },

  // Trainer-side: Get all pending requests
  getPendingRequests: async () => {
    const response = await api.get("/trainer/requests");
    return response.data;
  },

  // Trainer-side: Approve request
  approveRequest: async (requestId, responseMessage) => {
    const response = await api.put(`/trainer/requests/${requestId}/approve`, {
      responseMessage,
    });
    return response.data;
  },

  // Trainer-side: Reject request
  rejectRequest: async (requestId, responseMessage) => {
    const response = await api.put(`/trainer/requests/${requestId}/reject`, {
      responseMessage,
    });
    return response.data;
  },
};
