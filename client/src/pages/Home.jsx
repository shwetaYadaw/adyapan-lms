import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllCourses } from "../services/courseService";
import Footer from "../components/Footer";

const FEATURES = [
  { num: "01", title: "Access to top company networks and collaborations." },
  { num: "02", title: "Real industry insights you won't find in textbooks." },
  { num: "03", title: "Become placement-ready with our training, backed by lifetime job support." },
  { num: "04", title: "Mock interviews & resume-building workshops." },
  { num: "05", title: "6-month content access – lifetime career impact." },
];

const TICKER_TEXT = "INDIA'S LARGEST STUDENT COMMUNITY  •  ADYAPAN  •  LEARN. BUILD. SUCCEED.  •  ";

const STEPS = [
  { n: "01", t: "Register", d: "Create your free account in 30 seconds." },
  { n: "02", t: "Enroll",   d: "Pick any course and start immediately." },
  { n: "03", t: "Learn",    d: "Watch lessons, take notes, mark complete." },
  { n: "04", t: "Quiz",     d: "Pass the final quiz to unlock your certificate." },
  { n: "05", t: "Certify",  d: "Download a beautiful verified PDF certificate." },
];

export default function Home() {
  const { user } = useAuth();
  const [courseCount, setCourseCount] = useState("…");

  useEffect(() => {
    getAllCourses()
      .then(({ courses }) => setCourseCount(courses.length))
      .catch(() => setCourseCount("50+"));
  }, []);

  return (
    <div className="fade-in">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero-section text-white" style={{ background: "#0f172a" }}>
        <div className="container-xl py-5">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge fw-semibold mb-3 px-3 py-2"
                style={{ background: "rgba(245,158,11,.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.3)", fontSize: ".8rem" }}>
                🎓 India's #1 Free Learning Platform
              </span>
              <h1 className="display-4 fw-black lh-1 mb-3">
                Learn. Build.{" "}
                <span className="text-gradient-gold">Succeed.</span>
              </h1>
              <p className="lead mb-4" style={{ color: "#94a3b8", maxWidth: 520 }}>
                Enroll in expert-led courses, track your progress, pass quizzes
                and earn verified PDF certificates — completely free.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {user ? (
                  <Link to="/courses" className="btn btn-warning btn-lg px-5 fw-bold">
                    All Programs →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-warning btn-lg px-5 fw-bold">
                      Sign Up Free
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Stats column */}
            <div className="col-lg-5">
              <div className="row g-3">
                {[
                  { n: courseCount, l: "Courses Available" },
                  { n: "1 K+",  l: "Active Students" },
                  { n: "500+",  l: "Certificates Issued" },
                  { n: "100%",  l: "Free Forever" },
                ].map((s) => (
                  <div key={s.l} className="col-6">
                    <div className="rounded-3 p-3 text-center"
                      style={{ background: "#1e293b", border: "1px solid #334155" }}>
                      <div className="fw-black text-warning" style={{ fontSize: "2rem" }}>{s.n}</div>
                      <div style={{ fontSize: ".8rem", color: "#64748b" }}>{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NUMBERED FEATURE CARDS ──────────────────────────────────── */}
      <section className="py-5" style={{ background: "#f8fafc" }}>
        <div className="container-xl">
          <div className="text-center mb-5">
            <h2 className="fw-black" style={{ color: "#0f172a" }}>
              Why students choose <span className="text-gradient-gold">Adyapan</span>
            </h2>
          </div>
          <div className="row g-3">
            {FEATURES.map((f) => (
              <div key={f.num} className="col-sm-6 col-lg">
                <div className="feature-card h-100">
                  <div className="num">{f.num}</div>
                  <p className="feat-title mb-0">{f.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <span className="ticker-inner">
          {Array(6).fill(TICKER_TEXT).join("")}
        </span>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: "#fff" }}>
        <div className="container-xl">
          <div className="text-center mb-5">
            <h2 className="fw-black" style={{ color: "#0f172a" }}>How It Works</h2>
            <p className="text-muted">From sign-up to certificate in 5 simple steps.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {STEPS.map((s, i) => (
              <div key={s.n} className="col-sm-6 col-md-4 col-lg text-center">
                {/* Number circle */}
                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center
                  justify-content-center fw-black"
                  style={{ width: 60, height: 60, background: "#0f172a", color: "#f59e0b", fontSize: "1.3rem" }}>
                  {s.n}
                </div>
                <h6 className="fw-bold">{s.t}</h6>
                <p className="text-muted small mb-0">{s.d}</p>

                {/* Connector arrow (not on last) */}
                {i < STEPS.length - 1 && (
                  <div className="d-none d-lg-block position-absolute"
                    style={{ top: "30px", right: "-12px", color: "#f59e0b", fontSize: "1.4rem" }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      {!user && (
        <section className="py-5 text-center text-white" style={{ background: "#0f172a" }}>
          <div className="container">
            <h2 className="fw-black mb-2">Ready to start your career journey?</h2>
            <p style={{ color: "#94a3b8" }} className="mb-4">
              Join thousands of students building real-world skills on Adyapan.
            </p>
            <Link to="/register" className="btn btn-warning btn-lg px-5 fw-bold">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
