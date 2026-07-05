const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  enrollCourse,
  getEnrollments,
} = require("../controllers/enrollmentController");

router.post("/", protect, enrollCourse);
router.get("/my", protect, getEnrollments);

module.exports = router;