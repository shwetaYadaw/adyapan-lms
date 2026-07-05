import API from "../api/axios";

// Dashboard stats
export const getStats = () =>
  API.get("/admin/stats").then((r) => r.data);

// Users
export const getAllUsers = (params = {}) =>
  API.get("/admin/users", { params }).then((r) => r.data);

export const deleteUser = (id) =>
  API.delete(`/admin/users/${id}`).then((r) => r.data);

// Courses
export const getAdminCourses = () =>
  API.get("/admin/courses").then((r) => r.data);

export const getAdminCourseDetail = (id) =>
  API.get(`/admin/courses/${id}`).then((r) => r.data);

export const updateCourse = (id, data) =>
  API.put(`/admin/courses/${id}`, data).then((r) => r.data);

export const deleteCourse = (id) =>
  API.delete(`/admin/courses/${id}`).then((r) => r.data);

// Lessons
export const updateLesson = (id, data) =>
  API.put(`/admin/lessons/${id}`, data).then((r) => r.data);

export const deleteLesson = (id) =>
  API.delete(`/admin/lessons/${id}`).then((r) => r.data);

// Certificates
export const getAllCertificates = () =>
  API.get("/admin/certificates").then((r) => r.data);
