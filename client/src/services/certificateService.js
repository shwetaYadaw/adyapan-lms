import API from "../api/axios";

// Generate certificate for a completed course
export const generateCertificate = (courseId) =>
  API.post("/certificates/generate", { course: courseId }).then((r) => r.data);

// Get my certificates list
export const getMyCertificates = () =>
  API.get("/certificates/my").then((r) => r.data);

// Download certificate PDF as blob
export const downloadCertificate = async (certificateId, filename) => {
  const res = await API.get(`/certificates/download/${certificateId}`, {
    responseType: "blob",
  });
  // Trigger browser download
  const url  = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", filename || `${certificateId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
