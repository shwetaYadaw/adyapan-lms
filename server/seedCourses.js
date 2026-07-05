/**
 * seedCourses.js
 * Adds 6 real courses with YouTube lessons to MongoDB.
 * Run: node seedCourses.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Course   = require("./models/Course");
const Lesson   = require("./models/Lesson");
const User     = require("./models/User");

const COURSES = [
  {
    title:       "Complete JavaScript for Beginners",
    description: "Master JavaScript from scratch — variables, functions, DOM, ES6+, async/await and more. Perfect first programming course.",
    category:    "Programming",
    level:       "Beginner",
    duration:    "8 hours",
    thumbnail:   "https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg",
    lessons: [
      { title: "Introduction to JavaScript",      videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", notes: "JavaScript is the language of the web. In this lesson we cover what JS is and how browsers run it.", order: 1 },
      { title: "Variables & Data Types",           videoUrl: "https://www.youtube.com/watch?v=edlFjlzxkSI", notes: "Learn var, let, const and primitive data types: string, number, boolean, null, undefined.", order: 2 },
      { title: "Functions & Scope",               videoUrl: "https://www.youtube.com/watch?v=N8ap4k_1QEQ", notes: "Function declarations, expressions, arrow functions, and how scope works in JavaScript.", order: 3 },
      { title: "DOM Manipulation",                videoUrl: "https://www.youtube.com/watch?v=5fb2aPlgoys", notes: "Select, create, modify and delete HTML elements using JavaScript DOM APIs.", order: 4 },
      { title: "Async JavaScript & Promises",     videoUrl: "https://www.youtube.com/watch?v=PoRJizFvM7s", notes: "Understand the event loop, callbacks, Promises and async/await syntax.", order: 5 },
    ],
  },
  {
    title:       "Python for Data Science",
    description: "Learn Python programming with a focus on data science — NumPy, Pandas, Matplotlib and real-world data analysis projects.",
    category:    "Data Science",
    level:       "Beginner",
    duration:    "10 hours",
    thumbnail:   "https://img.youtube.com/vi/LHBE6Q9XlzI/maxresdefault.jpg",
    lessons: [
      { title: "Python Basics & Setup",           videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", notes: "Install Python, set up VS Code, understand variables, loops and functions.", order: 1 },
      { title: "NumPy Arrays",                    videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI", notes: "Create and manipulate N-dimensional arrays with NumPy for fast numerical computation.", order: 2 },
      { title: "Pandas DataFrames",               videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg", notes: "Load, clean and analyse tabular data using Pandas Series and DataFrames.", order: 3 },
      { title: "Data Visualisation with Matplotlib", videoUrl: "https://www.youtube.com/watch?v=3Xc3CA655Y4", notes: "Create line charts, bar plots, scatter plots and histograms with Matplotlib.", order: 4 },
      { title: "Exploratory Data Analysis Project", videoUrl: "https://www.youtube.com/watch?v=r-uOLxNrNk8", notes: "End-to-end EDA on a real dataset — cleaning, exploring and visualising insights.", order: 5 },
    ],
  },
  {
    title:       "React.js Full Course",
    description: "Build modern, component-based web applications with React — hooks, context, routing, API integration and deployment.",
    category:    "Web Development",
    level:       "Intermediate",
    duration:    "12 hours",
    thumbnail:   "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg",
    lessons: [
      { title: "React Fundamentals & JSX",         videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8", notes: "Understand what React is, create your first component and learn JSX syntax.", order: 1 },
      { title: "Props & State",                    videoUrl: "https://www.youtube.com/watch?v=IYvD9oBCuJI", notes: "Pass data between components with props and manage local state with useState.", order: 2 },
      { title: "useEffect & Data Fetching",        videoUrl: "https://www.youtube.com/watch?v=-MlNBTSg_Ww", notes: "Fetch data from APIs using useEffect, handle loading states and errors.", order: 3 },
      { title: "React Router v6",                  videoUrl: "https://www.youtube.com/watch?v=Ul3y1LXxzdU", notes: "Set up client-side routing with React Router: nested routes, params, navigation.", order: 4 },
      { title: "Context API & Global State",       videoUrl: "https://www.youtube.com/watch?v=5LrDIWkK_Bc", notes: "Share state across components without prop drilling using the Context API.", order: 5 },
    ],
  },
  {
    title:       "Machine Learning with Python",
    description: "Learn supervised and unsupervised machine learning algorithms using scikit-learn, build real models and understand evaluation metrics.",
    category:    "Data Science",
    level:       "Intermediate",
    duration:    "14 hours",
    thumbnail:   "https://img.youtube.com/vi/7eh4d6sabA0/maxresdefault.jpg",
    lessons: [
      { title: "ML Concepts & Workflow",           videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0", notes: "Overview of supervised vs unsupervised learning, the ML pipeline and scikit-learn intro.", order: 1 },
      { title: "Linear & Logistic Regression",    videoUrl: "https://www.youtube.com/watch?v=VmbA0pi2cRQ", notes: "Build regression and classification models, understand loss functions and gradient descent.", order: 2 },
      { title: "Decision Trees & Random Forests",  videoUrl: "https://www.youtube.com/watch?v=RmajweUFKvM", notes: "Train tree-based ensemble models, tune hyperparameters and visualise feature importance.", order: 3 },
      { title: "Model Evaluation & Cross-Validation", videoUrl: "https://www.youtube.com/watch?v=fSytzGwwBVw", notes: "Accuracy, precision, recall, F1-score, confusion matrix and k-fold cross-validation.", order: 4 },
      { title: "Clustering with K-Means",          videoUrl: "https://www.youtube.com/watch?v=4b5d3muPQmA", notes: "Unsupervised learning — group unlabelled data with K-Means and evaluate clusters.", order: 5 },
    ],
  },
  {
    title:       "HTML & CSS for Beginners",
    description: "Build your first websites from scratch with HTML5 and CSS3 — layouts, Flexbox, Grid, responsive design and best practices.",
    category:    "Web Development",
    level:       "Beginner",
    duration:    "6 hours",
    thumbnail:   "https://img.youtube.com/vi/qz0aGYrrlhU/maxresdefault.jpg",
    lessons: [
      { title: "HTML Structure & Tags",            videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU", notes: "Learn HTML document structure, semantic tags, headings, paragraphs, links and images.", order: 1 },
      { title: "CSS Selectors & Box Model",        videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40", notes: "Style elements with CSS selectors, understand the box model — margin, padding, border.", order: 2 },
      { title: "Flexbox Layout",                  videoUrl: "https://www.youtube.com/watch?v=fYq5PXgSsbE", notes: "Master Flexbox for one-dimensional layouts — align, justify and distribute items.", order: 3 },
      { title: "CSS Grid",                        videoUrl: "https://www.youtube.com/watch?v=9zBsdzdE4sM", notes: "Build complex two-dimensional layouts with CSS Grid — rows, columns and areas.", order: 4 },
      { title: "Responsive Design & Media Queries", videoUrl: "https://www.youtube.com/watch?v=srvUrASNj0s", notes: "Make websites look great on all screen sizes using media queries and mobile-first design.", order: 5 },
    ],
  },
  {
    title:       "Node.js & Express Backend Development",
    description: "Build scalable REST APIs with Node.js and Express — routing, middleware, MongoDB integration, authentication and deployment.",
    category:    "Web Development",
    level:       "Intermediate",
    duration:    "11 hours",
    thumbnail:   "https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg",
    lessons: [
      { title: "Node.js Core Modules",             videoUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4", notes: "Understand Node.js architecture, modules (fs, path, http) and npm package management.", order: 1 },
      { title: "Express.js Routing",              videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE", notes: "Set up an Express server, define routes, use route parameters and query strings.", order: 2 },
      { title: "Middleware & Error Handling",      videoUrl: "https://www.youtube.com/watch?v=lY6icfhap2o", notes: "Write custom middleware, use third-party middleware (morgan, cors, helmet) and global error handlers.", order: 3 },
      { title: "MongoDB & Mongoose",              videoUrl: "https://www.youtube.com/watch?v=fbYExfeFsI0", notes: "Connect to MongoDB, define Mongoose schemas and models, perform CRUD operations.", order: 4 },
      { title: "JWT Authentication",              videoUrl: "https://www.youtube.com/watch?v=mbsmsi7l3r4", notes: "Implement registration, login, JWT token generation and protected routes with middleware.", order: 5 },
    ],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin user to set as instructor
    const admin = await User.findOne({ role: "admin" });
    const instructorId = admin?._id || null;

    let created = 0;

    for (const data of COURSES) {
      const existing = await Course.findOne({ title: data.title });
      if (existing) {
        console.log(`  ⏭  Skipped (already exists): ${data.title}`);
        continue;
      }

      // Create course
      const course = await Course.create({
        title:       data.title,
        description: data.description,
        category:    data.category,
        level:       data.level,
        duration:    data.duration,
        thumbnail:   data.thumbnail,
        instructor:  instructorId,
      });

      // Create lessons and link to course
      const lessonIds = [];
      for (const l of data.lessons) {
        const lesson = await Lesson.create({ ...l, courseId: course._id });
        lessonIds.push(lesson._id);
      }

      // Push lesson refs into course
      course.lessons = lessonIds;
      await course.save();

      console.log(`  ✅ Created: ${data.title} (${data.lessons.length} lessons)`);
      created++;
    }

    console.log(`\n🏁 Done! ${created} new course(s) added.`);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
