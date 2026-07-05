import API from "../api/axios";

// Mark a lesson complete and sync progress
export const updateProgress = (data) =>
  API.post("/progress", data).then((r) => r.data);

// Get progress for a specific course
export const getProgress = (courseId) =>
  API.get(`/progress/${courseId}`).then((r) => r.data);
