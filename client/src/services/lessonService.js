import API from "../api/axios";

// Get all lessons of a course
export const getLessons = async (courseId) => {
  const res = await API.get(`/lessons/${courseId}`);
  return res.data;
};