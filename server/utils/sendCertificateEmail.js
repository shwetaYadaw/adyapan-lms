const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendCertificateEmail = async (
  studentEmail,
  studentName,
  pdfPath,
  courseName
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: "🎉 Course Completion Certificate",

    html: `
      <h2>Congratulations ${studentName}!</h2>

      <p>
        You have successfully completed the course
        <b>${courseName}</b>.
      </p>

      <p>Your certificate is attached.</p>

      <br>

      <p>Study Platform Team</p>
    `,

    attachments: [
      {
        filename: "Certificate.pdf",
        path: pdfPath,
      },
    ],
  });
};

module.exports = sendCertificateEmail;