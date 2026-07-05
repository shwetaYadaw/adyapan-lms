/**
 * generateCertificate.js
 * Produces a beautiful A4-landscape PDF certificate using PDFKit.
 * Returns only the FILENAME (not the full path) so it can be
 * reconstructed safely on any OS/deployment.
 */

const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");

const generateCertificate = (studentName, courseName, certificateId) => {
  const folder   = path.join(__dirname, "../certificates");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `${certificateId}.pdf`;
  const filePath = path.join(folder, filename);

  // A4 landscape
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  doc.pipe(fs.createWriteStream(filePath));

  const W = doc.page.width;   // 841.89
  const H = doc.page.height;  // 595.28

  // ── Background ──────────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill("#0f172a");

  // ── Gold outer border ────────────────────────────────────────────────────
  doc.rect(18, 18, W - 36, H - 36)
     .lineWidth(3)
     .strokeColor("#f59e0b")
     .stroke();

  // ── Inner thin border ───────────────────────────────────────────────────
  doc.rect(26, 26, W - 52, H - 52)
     .lineWidth(1)
     .strokeColor("#fcd34d")
     .stroke();

  // ── Top accent bar ───────────────────────────────────────────────────────
  doc.rect(18, 18, W - 36, 70).fill("#1e3a5f");

  // ── Institute / brand name in top bar ───────────────────────────────────
  doc.fontSize(20)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text("🎓  ADYAPAN  •  LEARNING  PLATFORM", 0, 36, { align: "center", width: W });

  // ── Decorative horizontal rule ───────────────────────────────────────────
  const lineY = 100;
  doc.moveTo(60, lineY).lineTo(W - 60, lineY)
     .lineWidth(1.5).strokeColor("#f59e0b").stroke();

  // ── "Certificate of Completion" heading ─────────────────────────────────
  doc.fontSize(38)
     .font("Helvetica-Bold")
     .fillColor("#ffffff")
     .text("Certificate of Completion", 0, 115, { align: "center", width: W });

  // ── Sub-line ─────────────────────────────────────────────────────────────
  doc.fontSize(14)
     .font("Helvetica")
     .fillColor("#94a3b8")
     .text("This is proudly presented to", 0, 165, { align: "center", width: W });

  // ── Student name ─────────────────────────────────────────────────────────
  doc.fontSize(34)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text(studentName, 0, 192, { align: "center", width: W });

  // ── Name underline ───────────────────────────────────────────────────────
  const nameWidth = Math.min(doc.widthOfString(studentName, { fontSize: 34 }) + 80, 500);
  const nameLineX = (W - nameWidth) / 2;
  doc.moveTo(nameLineX, 234).lineTo(nameLineX + nameWidth, 234)
     .lineWidth(1).strokeColor("#f59e0b").stroke();

  // ── "for successfully completing" ────────────────────────────────────────
  doc.fontSize(14)
     .font("Helvetica")
     .fillColor("#94a3b8")
     .text("for successfully completing the course", 0, 245, { align: "center", width: W });

  // ── Course name ──────────────────────────────────────────────────────────
  doc.fontSize(24)
     .font("Helvetica-Bold")
     .fillColor("#ffffff")
     .text(courseName, 60, 270, { align: "center", width: W - 120, lineGap: 4 });

  // ── Bottom section divider ───────────────────────────────────────────────
  const bottomY = H - 120;
  doc.moveTo(60, bottomY).lineTo(W - 60, bottomY)
     .lineWidth(1).strokeColor("#334155").stroke();

  // ── Issue date (left) ───────────────────────────────────────────────────
  const issuedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  doc.fontSize(11)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text("Date of Issue", 80, bottomY + 16);
  doc.fontSize(13)
     .font("Helvetica")
     .fillColor("#e2e8f0")
     .text(issuedDate, 80, bottomY + 33);

  // ── Certificate ID (center) ───────────────────────────────────────────────
  doc.fontSize(11)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text("Certificate ID", 0, bottomY + 16, { align: "center", width: W });
  doc.fontSize(10)
     .font("Helvetica")
     .fillColor("#94a3b8")
     .text(certificateId, 0, bottomY + 33, { align: "center", width: W });

  // ── Authorized signature placeholder (right) ─────────────────────────────
  const sigX = W - 220;
  doc.moveTo(sigX, bottomY + 46).lineTo(sigX + 140, bottomY + 46)
     .lineWidth(1).strokeColor("#475569").stroke();
  doc.fontSize(11)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text("Director", sigX, bottomY + 52, { width: 140, align: "center" });
  doc.fontSize(10)
     .font("Helvetica")
     .fillColor("#94a3b8")
     .text("Adyapan Learning Platform", sigX, bottomY + 68, { width: 140, align: "center" });

  // ── Seal / watermark circle ────────────────────────────────────────────
  const cx = W / 2, cy = H / 2 + 10;
  doc.circle(cx, cy, 46)
     .lineWidth(2)
     .strokeColor("#f59e0b")
     .fillOpacity(0.04)
     .fillAndStroke("#f59e0b", "#f59e0b");
  doc.fillOpacity(1);
  doc.fontSize(9)
     .font("Helvetica-Bold")
     .fillColor("#f59e0b")
     .text("ADYAPAN", cx - 26, cy - 6);
  doc.fontSize(7)
     .fillColor("#fcd34d")
     .text("CERTIFIED", cx - 20, cy + 6);

  doc.end();

  // Return ONLY the filename — caller can prepend the certificates dir
  return filename;
};

module.exports = generateCertificate;
