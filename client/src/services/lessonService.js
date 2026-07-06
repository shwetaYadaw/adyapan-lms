import API from "../api/axios";

// Get all lessons of a course — returns { lessons, modules }
export const getLessons = (courseId) =>
  API.get(`/lessons/${courseId}`).then((r) => r.data);
