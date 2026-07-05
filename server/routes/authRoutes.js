const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
  updateProfile,
} = require("../controllers/AuthController");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me
router.get("/me", protect, getProfile);

// PUT /api/auth/change-password
router.put("/change-password", protect, changePassword);

// PUT /api/auth/update-profile
router.put("/update-profile", protect, updateProfile);

module.exports = router;
