const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lessons  (admin)
// Create a lesson and push it into Course.lessons[]
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
// GET /api/lessons/:courseId
// Returns lessons grouped by module
// ─────────────────────────────────────────────────────────────────────────────
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .sort({ moduleOrder: 1, order: 1 });

    // Group by module
    const modulesMap = {};
    lessons.forEach((l) => {
      const mod = l.module || "General";
      if (!modulesMap[mod]) {
        modulesMap[mod] = { name: mod, order: l.moduleOrder || 1, lessons: [] };
      }
      modulesMap[mod].lessons.push(l);
    });

    const modules = Object.values(modulesMap).sort((a, b) => a.order - b.order);

    res.status(200).json({ success: true, lessons, modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
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
