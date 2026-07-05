const path        = require("path");
const fs          = require("fs");
const Certificate = require("../models/Certificate");
const User        = require("../models/User");
const Course      = require("../models/Course");
const Progress    = require("../models/Progress");
const Enrollment  = require("../models/Enrollment");

const generateCertificatePDF = require("../utils/generateCertificate");
const sendCertificateEmail   = require("../utils/sendCertificateEmail");

// Resolve the full filesystem path from a stored filename
const certFilePath = (filename) =>
  path.join(__dirname, "../certificates", path.basename(filename));

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/certificates/generate
// ─────────────────────────────────────────────────────────────────────────────
const generateCertificate = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { course: courseId } = req.body;

    const [user, courseData, progress] = await Promise.all([
      User.findById(studentId),
      Course.findById(courseId),
      Progress.findOne({ student: studentId, course: courseId }),
    ]);

    if (!user)       return res.status(404).json({ success: false, message: "Student not found." });
    if (!courseData) return res.status(404).json({ success: false, message: "Course not found." });

    // Also accept 100% from Enrollment.progress in case Progress doc is missing
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    const pct = progress?.percentage ?? enrollment?.progress ?? 0;

    if (pct < 100) {
      return res.status(400).json({
        success: false,
        message: `Complete all lessons first. Current progress: ${pct}%.`,
      });
    }

    // ── Already issued? ────────────────────────────────────────────────────
    let certificate = await Certificate.findOne({ student: studentId, course: courseId });

    if (certificate) {
      // Regenerate PDF if file was deleted from disk
      const fullPath = certFilePath(certificate.certificateUrl);
      if (!fs.existsSync(fullPath)) {
        const filename = generateCertificatePDF(user.name, courseData.title, certificate.certificateId);
        certificate.certificateUrl = filename;
        await certificate.save();
      }
      // Re-send email (non-blocking)
      sendCertificateEmail(
        user.email, user.name,
        certFilePath(certificate.certificateUrl),
        courseData.title
      ).catch(console.error);

      return res.status(200).json({
        success: true,
        message: "Certificate already issued — PDF re-sent to your email.",
        certificate,
      });
    }

    // ── Generate new certificate ───────────────────────────────────────────
    const certificateId = `ADY-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

    // Returns only the FILENAME now (fixed in generateCertificate.js)
    const filename = generateCertificatePDF(user.name, courseData.title, certificateId);

    certificate = await Certificate.create({
      student:        studentId,
      course:         courseId,
      certificateId,
      certificateUrl: filename,   // store filename only
    });

    // Mark enrollment as certificate issued
    await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { certificateIssued: true }
    );

    // Send email (non-blocking)
    sendCertificateEmail(
      user.email, user.name,
      certFilePath(filename),
      courseData.title
    ).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Certificate generated! Check your email for a copy.",
      certificate,
    });
  } catch (error) {
    console.error("generateCertificate error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates/download/:certificateId
// ─────────────────────────────────────────────────────────────────────────────
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    });

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    const fullPath = certFilePath(certificate.certificateUrl);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "PDF file not found on server." });
    }

    res.download(fullPath, `Adyapan-Certificate-${certificate.certificateId}.pdf`);
  } catch (error) {
    console.error("downloadCertificate error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates/my
// ─────────────────────────────────────────────────────────────────────────────
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("course", "title category level thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.error("getMyCertificates error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateCertificate, downloadCertificate, getMyCertificates };
