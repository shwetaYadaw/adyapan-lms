const Progress   = require("../models/Progress");
const Lesson     = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/progress
// Mark a lesson complete and recalculate percentage.
// Syncs the percentage back into the Enrollment record so MyCourses
// can show accurate progress without an extra DB lookup.
// ─────────────────────────────────────────────────────────────────────────────
const updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, completed } = req.body;
    const userId = req.user.id;

    // ── Find or create Progress doc ───────────────────────────────────────
    let progress = await Progress.findOne({ student: userId, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        student:          userId,
        course:           courseId,
        completedLessons: completed ? [lessonId] : [],
        percentage:       0,
      });
    } else {
      // Add lesson only if not already in the list (string compare)
      const alreadyDone = progress.completedLessons.some(
        (id) => id.toString() === lessonId.toString()
      );
      if (completed && !alreadyDone) {
        progress.completedLessons.push(lessonId);
      }
    }

    // ── Recalculate percentage ────────────────────────────────────────────
    const totalLessons = await Lesson.countDocuments({ courseId });
    progress.percentage =
      totalLessons === 0
        ? 0
        : Math.round((progress.completedLessons.length / totalLessons) * 100);

    await progress.save();

    // ── Sync to Enrollment so MyCourses reads the right value ─────────────
    await Enrollment.findOneAndUpdate(
      { student: userId, course: courseId },
      {
        progress:  progress.percentage,
        completed: progress.percentage === 100,
      }
    );

    // ── Serialise completedLessons as plain strings for the client ────────
    const responseData = {
      ...progress.toObject(),
      completedLessons: progress.completedLessons.map((id) => id.toString()),
    };

    res.status(200).json({ success: true, progress: responseData });
  } catch (error) {
    console.error("updateProgress error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/progress/:courseId
// Returns the Progress doc with completedLessons as plain strings.
// ─────────────────────────────────────────────────────────────────────────────
const getProgress = async (req, res) => {
  try {
    const userId   = req.user.id;
    const progress = await Progress.findOne({
      student: userId,
      course:  req.params.courseId,
    });

    if (!progress) {
      return res.status(200).json({ success: true, progress: null });
    }

    // Serialise IDs as plain strings so client-side .includes() works
    const responseData = {
      ...progress.toObject(),
      completedLessons: progress.completedLessons.map((id) => id.toString()),
    };

    res.status(200).json({ success: true, progress: responseData });
  } catch (error) {
    console.error("getProgress error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProgress, getProgress };
