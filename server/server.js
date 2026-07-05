require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const path       = require("path");
const rateLimit  = require("express-rate-limit");
const helmet     = require("helmet");
const morgan     = require("morgan");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes        = require("./routes/authRoutes");
const courseRoutes      = require("./routes/courseRoutes");
const lessonRoutes      = require("./routes/lessonRoutes");
const enrollmentRoutes  = require("./routes/enrollmentRoutes");
const progressRoutes    = require("./routes/progressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const quizRoutes        = require("./routes/quizRoutes");
const adminRoutes       = require("./routes/adminRoutes");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(morgan(isProd ? "combined" : "dev"));

// ── Rate limiting (200 req / 15 min per IP) ───────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter limit on auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, please try again in 15 minutes." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static: certificate PDFs ──────────────────────────────────────────────────
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => { console.error("❌ MongoDB Error:", err.message); process.exit(1); });

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Adyapan API is running",
    env:     process.env.NODE_ENV || "development",
    time:    new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({ success: true, message: "🎉 Adyapan Backend Running!" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/lessons",      lessonRoutes);
app.use("/api/enrollments",  enrollmentRoutes);
app.use("/api/progress",     progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quiz",         quizRoutes);
app.use("/api/admin",        adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "Internal server error." : err.message,
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
