const express   = require("express");
const router    = express.Router();
const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createOrUpdateQuiz,
  getQuizByCourse,
  getQuizAdmin,
  submitQuiz,
  getMyAttempts,
  deleteQuiz,
} = require("../controllers/quizController");

// ── IMPORTANT: specific paths BEFORE param routes (:courseId) ────────────────

// Admin: create / replace quiz
router.post("/",                    protect, adminOnly, createOrUpdateQuiz);

// Student: submit quiz answers  (must be before /:courseId to avoid collision)
router.post("/submit",              protect, submitQuiz);

// Admin: get full quiz with correct answers
router.get("/:courseId/admin",      protect, adminOnly, getQuizAdmin);

// Student: get attempt history for a course
router.get("/:courseId/attempts",   protect, getMyAttempts);

// Student: get quiz questions (no answers) — keep LAST among GET /:courseId routes
router.get("/:courseId",            protect, getQuizByCourse);

// Admin: delete quiz
router.delete("/:courseId",         protect, adminOnly, deleteQuiz);

module.exports = router;
