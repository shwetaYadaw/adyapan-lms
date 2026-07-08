const User        = require("../models/User");
const Course      = require("../models/Course");
const Lesson      = require("../models/Lesson");
const Enrollment  = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const Progress    = require("../models/Progress");
const QuizAttempt = require("../models/QuizAttempt");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Dashboard analytics
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      completedEnrollments,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
      Enrollment.countDocuments({ progress: 100 }),
      User.find({ role: "student" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt"),
    ]);

    // Enrollments per course (top 5)
    const popularCourses = await Enrollment.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "courses",
          localField:   "_id",
          foreignField: "_id",
          as:           "course",
        },
      },
      { $unwind: "$course" },
      { $project: { title: "$course.title", count: 1 } },
    ]);

    // Recent signups in last 7 days
    const sevenDaysAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({
      role:      "student",
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        completedEnrollments,
        recentSignups,
        recentUsers,
        popularCourses,
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
// List all users with optional search
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;

    // Search across ALL users (admin can see everyone)
    const query = search
      ? {
          $or: [
            { name:  { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete an admin account." });
    }

    await User.findByIdAndDelete(req.params.id);
    // Also clean up their data
    await Promise.all([
      Enrollment.deleteMany({ student: req.params.id }),
      Progress.deleteMany({ student: req.params.id }),
      Certificate.deleteMany({ student: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/courses
// All courses with lesson count and enrollment count
// ─────────────────────────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    // Attach enrollment count to each course
    const result = await Promise.all(
      courses.map(async (c) => {
        const enrollCount = await Enrollment.countDocuments({ course: c._id });
        return { ...c.toObject(), enrollCount };
      })
    );

    res.status(200).json({ success: true, courses: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/courses/:id
// Single course with full details
// ─────────────────────────────────────────────────────────────────────────────
const getCourseDetail = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("lessons");

    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/courses/:id
// Update a course
// ─────────────────────────────────────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/courses/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    // Clean up related data
    const lessonIds = course.lessons;
    await Promise.all([
      Lesson.deleteMany({ courseId: req.params.id }),
      Enrollment.deleteMany({ course: req.params.id }),
      Progress.deleteMany({ course: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: "Course and all related data deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/lessons/:id
// Update a lesson
// ─────────────────────────────────────────────────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found." });

    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/lessons/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found." });

    // Remove lesson reference from its course
    await Course.findByIdAndUpdate(lesson.courseId, {
      $pull: { lessons: lesson._id },
    });

    res.status(200).json({ success: true, message: "Lesson deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/certificates
// All certificates with student + course info
// ─────────────────────────────────────────────────────────────────────────────
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student", "name email")
      .populate("course", "title category")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllCourses,
  getCourseDetail,
  updateCourse,
  deleteCourse,
  updateLesson,
  deleteLesson,
  getAllCertificates,
};
