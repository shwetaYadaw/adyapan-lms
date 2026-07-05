const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// ─────────────────────────────────────────────────────────────────────────────
// Create Lesson  (admin)
// POST /api/lessons
// ─────────────────────────────────────────────────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);

    // Push lesson reference into Course.lessons array
    await Course.findByIdAndUpdate(lesson.courseId, {
      $push: { lessons: lesson._id },
    });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Lessons of a Course  (public)
// GET /api/lessons/:courseId
// ─────────────────────────────────────────────────────────────────────────────
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
    }).sort({ order: 1 });

    res.status(200).json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Lesson  (public)
// GET /api/lessons/single/:id
// ─────────────────────────────────────────────────────────────────────────────
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found." });
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLesson, getLessons, getLessonById };