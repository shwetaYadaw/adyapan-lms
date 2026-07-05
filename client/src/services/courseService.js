import API from "../api/axios";

export const getAllCourses = (params = {}) =>
  API.get("/courses", { params }).then((r) => r.data);

export const getCourseById = (id) =>
  API.get(`/courses/${id}`).then((r) => r.data);

export const createCourse = (data) =>
  API.post("/courses", data).then((r) => r.data);
