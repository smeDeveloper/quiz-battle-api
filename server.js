const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const cors = require("cors");

require("dotenv").config();

// Import routes
const getQuizzes = require("./api/Get Quizzes");
const createQuiz = require("./api/Create Quiz");
const getQuizDetails = require("./api/Get Quiz Details");
const submit = require("./api/Submit");
const getQuiz = require("./api/Get Quiz");
const updateQuiz = require("./api/Update Quiz");
const deleteQuiz = require("./api/Remove Quiz");
const getNoCorrectAnswersQuiz = require("./api/Get Quiz (No correct answer)");
const getCorrectAnswersQuiz = require("./api/Get Quiz (Correct Answers)");
const getUserResult = require("./api/Get User Result");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ origin: "https://quiz-battle-app.netlify.app" }));

// Async startup
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URL_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ CONNECTED TO MONGODB");

    // Register routes after DB is ready
    app.use("/api", getQuizzes);
    app.use("/api", createQuiz);
    app.use("/api", getQuizDetails);
    app.use("/api", submit);
    app.use("/api", getQuiz);
    app.use("/api", updateQuiz);
    app.use("/api", deleteQuiz);
    app.use("/api", getNoCorrectAnswersQuiz);
    app.use("/api", getCorrectAnswersQuiz);
    app.use("/api", getUserResult);

    // Start server
    app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));

  } catch (err) {
    console.error("❌ FAILED TO CONNECT TO MONGODB:", err.message);
    process.exit(1); // Or keep server alive with degraded mode
  }
}

startServer();

module.exports = app;
module.exports.handler = serverless(app);