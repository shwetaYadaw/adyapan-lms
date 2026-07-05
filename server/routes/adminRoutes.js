const express   = require("express");
const router    = express.Router();
const protect   = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
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
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/stats", getStats);

// ── User Management ──────────────────────────────────────────────────────────
router.get("/users",       getAllUsers);
router.delete("/users/:id", deleteUser);

// ── Course Management ────────────────────────────────────────────────────────
router.get("/courses",        getAllCourses);
router.get("/courses/:id",    getCourseDetail);
router.put("/courses/:id",    updateCourse);
router.delete("/courses/:id", deleteCourse);

// ── Lesson Management ────────────────────────────────────────────────────────
router.put("/lessons/:id",    updateLesson);
router.delete("/lessons/:id", deleteLesson);

// ── Certificates ─────────────────────────────────────────────────────────────
router.get("/certificates", getAllCertificates);

module.exports = router;
