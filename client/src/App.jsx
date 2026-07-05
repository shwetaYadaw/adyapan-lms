import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Public pages
import Home         from "./pages/Home";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Courses      from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import NotFound     from "./pages/NotFound";

// Student pages
import Dashboard    from "./pages/Dashboard";
import MyCourses    from "./pages/MyCourses";
import Lessons      from "./pages/Lessons";
import QuizPage     from "./pages/QuizPage";
import Certificates from "./pages/Certificates";
import Profile      from "./pages/Profile";

// Admin pages
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminCourses      from "./pages/admin/AdminCourses";
import AdminAddCourse    from "./pages/admin/AdminAddCourse";
import AdminEditCourse   from "./pages/admin/AdminEditCourse";
import AdminAddLesson    from "./pages/admin/AdminAddLesson";
import AdminUsers        from "./pages/admin/AdminUsers";
import AdminQuiz         from "./pages/admin/AdminQuiz";
import AdminCertificates from "./pages/admin/AdminCertificates";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* ── Public (no login required) ──────────────────────────────── */}
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/courses"     element={<Courses />} />        {/* public browse */}
        <Route path="/courses/:id" element={<CourseDetail />} />   {/* public detail */}

        {/* ── Student (must be logged in) ─────────────────────────────── */}
        <Route path="/dashboard"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/my-courses"        element={<PrivateRoute><MyCourses /></PrivateRoute>} />
        <Route path="/lessons/:courseId" element={<PrivateRoute><Lessons /></PrivateRoute>} />
        <Route path="/quiz/:courseId"    element={<PrivateRoute><QuizPage /></PrivateRoute>} />
        <Route path="/certificates"      element={<PrivateRoute><Certificates /></PrivateRoute>} />
        <Route path="/profile"           element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* ── Admin (must be logged in + admin role) ──────────────────── */}
        <Route path="/admin"                         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/courses"                 element={<AdminRoute><AdminCourses /></AdminRoute>} />
        <Route path="/admin/courses/add"             element={<AdminRoute><AdminAddCourse /></AdminRoute>} />
        <Route path="/admin/courses/edit/:id"        element={<AdminRoute><AdminEditCourse /></AdminRoute>} />
        <Route path="/admin/courses/:id/lessons/add" element={<AdminRoute><AdminAddLesson /></AdminRoute>} />
        <Route path="/admin/courses/:courseId/quiz"  element={<AdminRoute><AdminQuiz /></AdminRoute>} />
        <Route path="/admin/users"                   element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/certificates"            element={<AdminRoute><AdminCertificates /></AdminRoute>} />

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
