/**
 * seedQuizzes.js
 * Adds 5-question quizzes for all existing courses.
 * Run: node seedQuizzes.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Course   = require("./models/Course");
const Quiz     = require("./models/Quiz");

// Quiz bank — keyed by partial course title match
const QUIZ_BANK = {
  "JavaScript": {
    title: "JavaScript Fundamentals Quiz",
    passingScore: 60,
    questions: [
      {
        question: "Which keyword is used to declare a block-scoped variable in JavaScript?",
        options: ["var", "let", "define", "constant"],
        correctAnswer: 1,
        explanation: "'let' creates a block-scoped variable. 'var' is function-scoped.",
      },
      {
        question: "What does '===' check in JavaScript?",
        options: ["Value only", "Type only", "Value and type", "Neither"],
        correctAnswer: 2,
        explanation: "'===' is strict equality — checks both value AND type.",
      },
      {
        question: "What will 'typeof null' return?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correctAnswer: 2,
        explanation: "typeof null returns 'object' — a well-known JavaScript quirk.",
      },
      {
        question: "Which method converts a JSON string into a JavaScript object?",
        options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"],
        correctAnswer: 1,
        explanation: "JSON.parse() converts a JSON string → JS object.",
      },
      {
        question: "What is a closure in JavaScript?",
        options: [
          "A function with no return value",
          "A function that remembers its outer scope even after the outer function has returned",
          "A method that closes the browser window",
          "A loop that terminates immediately",
        ],
        correctAnswer: 1,
        explanation: "A closure gives a function access to its outer scope even after the outer function finishes.",
      },
    ],
  },

  "Python": {
    title: "Python & Data Science Quiz",
    passingScore: 60,
    questions: [
      {
        question: "Which library is primarily used for data manipulation in Python?",
        options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
        correctAnswer: 1,
        explanation: "Pandas is the go-to library for data manipulation — DataFrames and Series.",
      },
      {
        question: "What does the .shape attribute return in Pandas?",
        options: ["Column names", "Row count only", "(rows, columns) tuple", "Data types"],
        correctAnswer: 2,
        explanation: ".shape returns a tuple of (number_of_rows, number_of_columns).",
      },
      {
        question: "Which NumPy function creates an array of zeros?",
        options: ["np.empty()", "np.zeros()", "np.blank()", "np.null()"],
        correctAnswer: 1,
        explanation: "np.zeros(shape) creates an array filled with 0.0.",
      },
      {
        question: "In Python, which loop is used to iterate over a list?",
        options: ["while", "for", "do-while", "repeat"],
        correctAnswer: 1,
        explanation: "'for item in list:' is Python's standard iteration syntax.",
      },
      {
        question: "What does EDA stand for in data science?",
        options: ["Extended Data Analysis", "Exploratory Data Analysis", "External Data Access", "Encoded Data Array"],
        correctAnswer: 1,
        explanation: "EDA = Exploratory Data Analysis — the process of visually and statistically summarising data.",
      },
    ],
  },

  "React": {
    title: "React.js Quiz",
    passingScore: 60,
    questions: [
      {
        question: "What hook is used to manage local state in a React functional component?",
        options: ["useEffect", "useRef", "useState", "useContext"],
        correctAnswer: 2,
        explanation: "useState returns a state value and a setter function.",
      },
      {
        question: "What does the useEffect hook do?",
        options: [
          "Stores global state",
          "Runs side effects after render",
          "Creates a new component",
          "Handles form submission",
        ],
        correctAnswer: 1,
        explanation: "useEffect runs after the component renders, perfect for API calls, subscriptions, etc.",
      },
      {
        question: "In JSX, how do you render a JavaScript expression?",
        options: ["{{ value }}", "<%=value%>", "{value}", "<value>"],
        correctAnswer: 2,
        explanation: "JSX uses single curly braces {expression} to embed JavaScript.",
      },
      {
        question: "What is the virtual DOM in React?",
        options: [
          "The actual browser DOM",
          "A CSS framework",
          "A lightweight JS representation of the real DOM",
          "A server-side rendering technique",
        ],
        correctAnswer: 2,
        explanation: "React keeps a virtual DOM in memory and diffs it against the real DOM for efficient updates.",
      },
      {
        question: "Which React Router component renders the first matching route?",
        options: ["<Switch>", "<Router>", "<Routes>", "<Link>"],
        correctAnswer: 2,
        explanation: "In React Router v6, <Routes> renders only the first matching <Route>.",
      },
    ],
  },

  "Machine Learning": {
    title: "Machine Learning Quiz",
    passingScore: 60,
    questions: [
      {
        question: "What type of learning uses labelled training data?",
        options: ["Unsupervised", "Reinforcement", "Supervised", "Semi-supervised"],
        correctAnswer: 2,
        explanation: "Supervised learning trains on input-output pairs (labelled data).",
      },
      {
        question: "Which metric measures the proportion of true positives out of all actual positives?",
        options: ["Precision", "Accuracy", "Recall", "F1 Score"],
        correctAnswer: 2,
        explanation: "Recall = TP / (TP + FN) — measures how many actual positives were caught.",
      },
      {
        question: "What does 'overfitting' mean in machine learning?",
        options: [
          "Model performs well on both train and test data",
          "Model learns training data too well and fails on new data",
          "Model is too simple to learn patterns",
          "Model takes too long to train",
        ],
        correctAnswer: 1,
        explanation: "An overfit model memorises training data but generalises poorly to unseen data.",
      },
      {
        question: "Which algorithm is used for clustering unlabelled data?",
        options: ["Linear Regression", "K-Means", "Decision Tree", "Logistic Regression"],
        correctAnswer: 1,
        explanation: "K-Means is an unsupervised clustering algorithm that groups data into K clusters.",
      },
      {
        question: "What is cross-validation used for?",
        options: [
          "Visualising data",
          "Cleaning missing values",
          "Estimating model performance on unseen data",
          "Selecting features",
        ],
        correctAnswer: 2,
        explanation: "Cross-validation gives a more reliable estimate of model performance by testing on multiple folds.",
      },
    ],
  },

  "HTML": {
    title: "HTML & CSS Quiz",
    passingScore: 60,
    questions: [
      {
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1,
        explanation: "The <a> anchor tag creates clickable hyperlinks.",
      },
      {
        question: "Which CSS property controls the space between the content and its border?",
        options: ["margin", "spacing", "padding", "gap"],
        correctAnswer: 2,
        explanation: "padding is the space inside the border; margin is outside.",
      },
      {
        question: "Which CSS display value creates a flex container?",
        options: ["block", "inline", "flex", "grid"],
        correctAnswer: 2,
        explanation: "display: flex enables Flexbox layout on a container.",
      },
      {
        question: "What does the 'viewport' meta tag control?",
        options: [
          "Page background colour",
          "Font size",
          "How the page scales on mobile devices",
          "Page title",
        ],
        correctAnswer: 2,
        explanation: "<meta name='viewport'> controls scaling on mobile — essential for responsive design.",
      },
      {
        question: "Which CSS unit is relative to the root element's font size?",
        options: ["em", "px", "rem", "%"],
        correctAnswer: 2,
        explanation: "rem (root em) is relative to the <html> element's font size.",
      },
    ],
  },

  "Node": {
    title: "Node.js & Express Quiz",
    passingScore: 60,
    questions: [
      {
        question: "What is Node.js?",
        options: [
          "A browser-based JavaScript framework",
          "A JavaScript runtime built on Chrome's V8 engine",
          "A CSS preprocessor",
          "A relational database",
        ],
        correctAnswer: 1,
        explanation: "Node.js is a server-side JavaScript runtime built on V8 — it runs JS outside the browser.",
      },
      {
        question: "Which method defines a GET route in Express?",
        options: ["app.get()", "app.route()", "app.request()", "app.fetch()"],
        correctAnswer: 0,
        explanation: "app.get('/path', handler) registers a GET route in Express.",
      },
      {
        question: "What does middleware do in Express?",
        options: [
          "Renders HTML templates",
          "Connects to the database",
          "Executes code between request and response",
          "Compiles JavaScript",
        ],
        correctAnswer: 2,
        explanation: "Middleware functions run during the request-response cycle — logging, auth, parsing etc.",
      },
      {
        question: "Which Mongoose method finds one document matching a filter?",
        options: ["Model.find()", "Model.findOne()", "Model.get()", "Model.first()"],
        correctAnswer: 1,
        explanation: "Model.findOne({ filter }) returns the first document matching the filter.",
      },
      {
        question: "What does JWT stand for?",
        options: [
          "JavaScript Web Token",
          "Java Web Tool",
          "JSON Web Token",
          "Just Web Testing",
        ],
        correctAnswer: 2,
        explanation: "JWT = JSON Web Token — a compact, URL-safe way to represent claims for authentication.",
      },
    ],
  },
};

/** Match a course title to a quiz template */
const matchQuiz = (title) => {
  const t = title.toLowerCase();
  if (t.includes("javascript"))        return QUIZ_BANK["JavaScript"];
  if (t.includes("python"))            return QUIZ_BANK["Python"];
  if (t.includes("react"))             return QUIZ_BANK["React"];
  if (t.includes("machine learning"))  return QUIZ_BANK["Machine Learning"];
  if (t.includes("html"))              return QUIZ_BANK["HTML"];
  if (t.includes("node"))              return QUIZ_BANK["Node"];
  return null;
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const courses = await Course.find();
    let created = 0;

    for (const course of courses) {
      const existing = await Quiz.findOne({ course: course._id });
      if (existing) {
        console.log(`  ⏭  Skipped (quiz exists): ${course.title}`);
        continue;
      }

      const template = matchQuiz(course.title);
      if (!template) {
        console.log(`  ⚠️  No quiz template for: ${course.title}`);
        continue;
      }

      await Quiz.create({ course: course._id, ...template });
      console.log(`  ✅ Quiz created: ${course.title}`);
      created++;
    }

    console.log(`\n🏁 Done! ${created} quiz/quizzes created.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
