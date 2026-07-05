import API from "../api/axios";

// Enroll the current user in a course
export const enrollCourse = (courseId) =>
  API.post("/enrollments", { courseId }).then((r) => r.data);

// Get all enrollments for the current user (with course populated)
export const getMyEnrollments = () =>
  API.get("/enrollments/my").then((r) => r.data);
