const mongoose = require("mongoose");

// Stores every quiz attempt so students can review their history
const quizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    // Answers submitted: array of 0-based option indices, one per question
    answers: {
      type: [Number],
      required: true,
    },
    score: {
      type: Number,   // number of correct answers
      required: true,
    },
    total: {
      type: Number,   // total number of questions
      required: true,
    },
    percentage: {
      type: Number,   // score/total * 100
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
