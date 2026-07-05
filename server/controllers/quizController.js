const Quiz        = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course      = require("../models/Course");

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Create or replace the quiz for a course
// POST /api/quiz
// Body: { courseId, title?, passingScore?, questions: [{question, options[4], correctAnswer, explanation?}] }
// ─────────────────────────────────────────────────────────────────────────────
const createOrUpdateQuiz = async (req, res) => {
  try {
    const { courseId, title, passingScore, questions } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Provide at least one question." });
    }

    // Upsert: update existing quiz or create new one
    const quiz = await Quiz.findOneAndUpdate(
      { course: courseId },
      {
        course:       courseId,
        title:        title || "Course Quiz",
        passingScore: passingScore ?? 60,
        questions,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("createOrUpdateQuiz error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC (enrolled student): Get quiz for a course – correct answers stripped
// GET /api/quiz/:courseId
// ─────────────────────────────────────────────────────────────────────────────
const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "No quiz found for this course." });
    }

    // Remove correct answers before sending to client
    const safeQuestions = quiz.questions.map((q) => ({
      _id:         q._id,
      question:    q.question,
      options:     q.options,
      // correctAnswer intentionally omitted
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id:          quiz._id,
        title:        quiz.title,
        passingScore: quiz.passingScore,
        questions:    safeQuestions,
      },
    });
  } catch (error) {
    console.error("getQuizByCourse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Get full quiz including correct answers
// GET /api/quiz/:courseId/admin
// ─────────────────────────────────────────────────────────────────────────────
const getQuizAdmin = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "No quiz found for this course." });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Submit quiz answers and get result
// POST /api/quiz/submit
// Body: { courseId, answers: [0, 2, 1, ...] }  (0-based option index per question)
// ─────────────────────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { courseId, answers } = req.body;
    const studentId = req.user.id;

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Submit exactly ${quiz.questions.length} answers.`,
      });
    }

    // Score the submission
    let score = 0;
    const breakdown = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) score++;
      return {
        question:       q.question,
        options:        q.options,
        yourAnswer:     answers[i],
        correctAnswer:  q.correctAnswer,
        isCorrect,
        explanation:    q.explanation,
      };
    });

    const total      = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed     = percentage >= quiz.passingScore;

    // Save attempt record
    const attempt = await QuizAttempt.create({
      student:    studentId,
      course:     courseId,
      quiz:       quiz._id,
      answers,
      score,
      total,
      percentage,
      passed,
    });

    res.status(200).json({
      success: true,
      result: {
        score,
        total,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        breakdown,
        attemptId: attempt._id,
      },
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Get my quiz attempt history for a course
// GET /api/quiz/:courseId/attempts
// ─────────────────────────────────────────────────────────────────────────────
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.user.id,
      course:  req.params.courseId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Delete quiz for a course
// DELETE /api/quiz/:courseId
// ─────────────────────────────────────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findOneAndDelete({ course: req.params.courseId });
    res.status(200).json({ success: true, message: "Quiz deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrUpdateQuiz,
  getQuizByCourse,
  getQuizAdmin,
  submitQuiz,
  getMyAttempts,
  deleteQuiz,
};
