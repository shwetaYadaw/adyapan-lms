const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");

const {
  generateCertificate,
  downloadCertificate,
  getMyCertificates,
} = require("../controllers/certificateController");

// GET /api/certificates/my  – list my certificates
router.get("/my",                        protect, getMyCertificates);

// POST /api/certificates/generate
router.post("/generate",                 protect, generateCertificate);

// GET /api/certificates/download/:certificateId
router.get("/download/:certificateId",   protect, downloadCertificate);

module.exports = router;