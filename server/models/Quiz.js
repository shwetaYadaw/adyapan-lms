const mongoose = require("mongoose");

// ─── Single question sub-schema ─────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],   // exactly 4 strings
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message: "Each question must have exactly 4 options.",
    },
  },
  // 0-based index of the correct option
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: "",
  },
});

// ─── Quiz schema (one quiz per course) ──────────────────────────────────────
const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,   // one quiz per course
    },
    title: {
      type: String,
      default: "Course Quiz",
    },
    // Minimum percentage to pass (default 60%)
    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
