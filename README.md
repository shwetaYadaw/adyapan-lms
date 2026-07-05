# 🎓 Adyapan – Learning Management System

A full-stack LMS built with **React 19 + Vite**, **Node.js + Express**, **MongoDB**, **Bootstrap 5**, **PDFKit** and **JWT Auth**.

---

## 🚀 Quick Start (3 terminals)

### Prerequisites
- Node.js ≥ 18  
- MongoDB running locally (`mongod`)

### Step 1 — Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 2 — Configure environment

The `.env` file already exists at `server/.env`. Verify these values:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/study-platform
JWT_SECRET=mySuperSecretKey123
CLIENT_URL=http://localhost:5173
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### Step 3 — Seed the database (first time only)

```bash
cd server

# 1. Create admin account
node seedAdmin.js
# → admin@adyapan.com / Admin@123

# 2. Add 6 courses with YouTube lessons
node seedCourses.js

# 3. Add 5-question quizzes for every course
node seedQuizzes.js
```

### Step 4 — Start the servers

```bash
# Terminal 1 — Backend
cd server
npm run dev         # → http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev         # → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🎓 Student Journey (end-to-end)

| Step | Action | Where |
|------|--------|-------|
| 1 | Create account | `/register` |
| 2 | Browse courses | `/courses` |
| 3 | Enroll (free) | Course detail page |
| 4 | Watch all video lessons | `/lessons/:courseId` |
| 5 | Click **✓ Mark as Complete** on each lesson | Lesson page |
| 6 | Progress bar hits **100%** | Sidebar turns gold |
| 7 | Green completion banner appears with your name | Top of lesson page |
| 8 | Take the quiz (need ≥ 60%) | `/quiz/:courseId` |
| 9 | Get Certificate | My Courses → **🏆 Get Certificate for [Name]** |
| 10 | PDF auto-downloads | Named `Adyapan-[YourName]-[Course].pdf` |
| 11 | View all certificates | `/certificates` |

---

## ⚙️ Admin Panel

Login as admin at `/login` → redirected to `/admin`

| Task | Route |
|------|-------|
| View analytics | `/admin` |
| Add a new course | `/admin/courses/add` |
| Edit course / delete lessons | `/admin/courses/edit/:id` |
| Add YouTube lessons | `/admin/courses/:id/lessons/add` |
| Create quiz questions | `/admin/courses/:courseId/quiz` |
| Manage students | `/admin/users` |
| View all certificates | `/admin/certificates` |

---

## 📁 Project Structure

```
study-platform/
├── client/                    React + Vite
│   └── src/
│       ├── api/               Axios instance (proxy-aware)
│       ├── components/        Navbar, Footer, AdminSidebar, AlertMsg…
│       ├── context/           AuthContext (JWT + user state)
│       ├── pages/             All 16 student + 8 admin pages
│       └── services/          API service functions
│
└── server/                    Node.js + Express
    ├── controllers/           8 controllers (auth, course, lesson…)
    ├── middleware/             JWT auth + admin role guard
    ├── models/                8 Mongoose models
    ├── routes/                8 route files
    ├── utils/                 PDF generator, email sender
    ├── certificates/          Generated PDFs (auto-created)
    ├── seedAdmin.js           Create admin account
    ├── seedCourses.js         Add 6 courses + lessons
    └── seedQuizzes.js         Add quizzes for all courses
```

---

## 📡 Full API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new student |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET  | `/api/auth/me` | ✅ | Get logged-in user profile |
| PUT  | `/api/auth/update-profile` | ✅ | Update display name |
| PUT  | `/api/auth/change-password` | ✅ | Change password |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/courses` | — | All courses (filter: `?category=&level=&search=`) |
| GET  | `/api/courses/:id` | — | Course + lessons |
| POST | `/api/courses` | Admin | Create course |

### Lessons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/lessons/:courseId` | — | All lessons |
| POST | `/api/lessons` | Admin | Add lesson |
| DELETE | `/api/admin/lessons/:id` | Admin | Delete lesson |

### Enrollments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/enrollments` | ✅ | Enroll in course |
| GET  | `/api/enrollments/my` | ✅ | My enrolled courses + progress |

### Progress
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/progress` | ✅ | Mark lesson complete, sync % to Enrollment |
| GET  | `/api/progress/:courseId` | ✅ | Get progress for a course |

### Quiz
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quiz` | Admin | Create/replace quiz |
| GET  | `/api/quiz/:courseId` | ✅ | Quiz questions (no answers) |
| POST | `/api/quiz/submit` | ✅ | Submit answers → score + breakdown |
| GET  | `/api/quiz/:courseId/attempts` | ✅ | My attempt history |
| GET  | `/api/quiz/:courseId/admin` | Admin | Full quiz with answers |
| DELETE | `/api/quiz/:courseId` | Admin | Delete quiz |

### Certificates
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/certificates/generate` | ✅ | Generate PDF with student name |
| GET  | `/api/certificates/my` | ✅ | My certificates |
| GET  | `/api/certificates/download/:id` | ✅ | Download PDF |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/admin/stats` | Admin | Platform analytics |
| GET  | `/api/admin/users` | Admin | All students (paginated, searchable) |
| DELETE | `/api/admin/users/:id` | Admin | Delete student |
| GET  | `/api/admin/courses` | Admin | All courses |
| PUT  | `/api/admin/courses/:id` | Admin | Update course |
| DELETE | `/api/admin/courses/:id` | Admin | Delete course + lessons |
| GET  | `/api/admin/certificates` | Admin | All issued certificates |

---

## 🗃 Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password (hashed), role (student/admin) |
| **Course** | title, description, category, level, duration, thumbnail, lessons[], instructor |
| **Lesson** | courseId, title, description, videoUrl (YouTube), notes, order |
| **Enrollment** | student, course, progress (0-100%), completed, certificateIssued |
| **Progress** | student, course, completedLessons[] (ObjectIds as strings), percentage |
| **Quiz** | course, title, passingScore (default 60%), questions[{question, options[4], correctAnswer, explanation}] |
| **QuizAttempt** | student, course, quiz, answers[], score, total, percentage, passed |
| **Certificate** | student, course, certificateId (ADY-xxx), issuedDate, certificateUrl (filename) |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT tokens expire in **7 days**
- Protected routes require `Authorization: Bearer <token>`
- Admin routes additionally require `role === "admin"`
- CORS restricted to `CLIENT_URL` env variable

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Bootstrap 5, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB 8, Mongoose 9 |
| Auth | jsonwebtoken, bcrypt |
| PDF | PDFKit (A4 landscape with gold border, student name, QR seal) |
| Email | Nodemailer (Gmail App Password) |
| Dev | Vite 8, Nodemon 3 |

---

## 📧 Email Setup

1. Enable 2FA on your Gmail account  
2. Go to **Google Account → Security → App Passwords**  
3. Create an app password for "Mail"  
4. Add to `server/.env`:
   ```
   EMAIL_USER=your@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
   Certificates are automatically emailed as PDF attachments after generation.

---

## 🎨 Brand

- **Primary dark**: `#0f172a`  
- **Gold accent**: `#f59e0b`  
- **Success green**: `#22c55e`  
- Font: Segoe UI / system-ui
