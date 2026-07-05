const express = require("express");
const router = express.Router();

const {
  updateProgress,
  getProgress,
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

// Update Progress
router.post("/", protect, updateProgress);

// Get Progress
router.get("/:courseId", protect, getProgress);

module.exports = router;