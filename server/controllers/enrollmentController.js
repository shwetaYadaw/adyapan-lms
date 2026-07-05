const Enrollment = require("../models/Enrollment");

// ================= Enroll Student =================
const enrollCourse = async (req, res) => {
  try {
    const student = req.user.id;
    const { courseId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    const enrollment = await Enrollment.create({
      student,
      course: courseId,
    });

    res.status(201).json({
      success: true,
      message: "Enrolled successfully.",
      enrollment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Get My Enrollments =================
const getEnrollments = async (req, res) => {
  try {
    const student = req.user.id;

    const enrollments = await Enrollment.find({
      student,
    }).populate("course");

    res.status(200).json({
      success: true,
      enrollments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  enrollCourse,
  getEnrollments,
};