const Course      = require("../models/Course");
const Lesson      = require("../models/Lesson");
const Enrollment  = require("../models/Enrollment");

// ─────────────────────────────────────────────────────────────────────────────
// Create Course  (admin only)
// POST /api/courses
// ─────────────────────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user.id,   // set creator as instructor
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get All Courses  (public)
// GET /api/courses?category=&level=&search=
// ─────────────────────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (level)    filter.level    = level;
    if (search)   filter.$or = [
      { title:       { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];

    const courses = await Course.find(filter)
      .populate("instructor", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Course  (public)
// GET /api/courses/:id
// ─────────────────────────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Attach enrollment count
    const enrollCount = await Enrollment.countDocuments({ course: course._id });

    res.status(200).json({ success: true, course: { ...course.toObject(), enrollCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
};