import API from "../api/axios";

// Get quiz questions for a course (no correct answers)
export const getQuiz = (courseId) =>
  API.get(`/quiz/${courseId}`).then((r) => r.data);

// Submit answers → returns score + breakdown
export const submitQuiz = (courseId, answers) =>
  API.post("/quiz/submit", { courseId, answers }).then((r) => r.data);

// Get my past attempts for a course
export const getMyAttempts = (courseId) =>
  API.get(`/quiz/${courseId}/attempts`).then((r) => r.data);

// Admin: create/replace quiz
export const saveQuiz = (data) =>
  API.post("/quiz", data).then((r) => r.data);

// Admin: delete quiz
export const deleteQuiz = (courseId) =>
  API.delete(`/quiz/${courseId}`).then((r) => r.data);
