const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const cors = require("cors");

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

const getQuizzes = require("./api/Get Quizzes");
const createQuiz = require("./api/Create Quiz");
const getQuizDetails = require("./api/Get Quiz Details");
const submit = require("./api/Submit");
const getQuiz = require("./api/Get Quiz");
const updateQuiz = require("./api/Update Quiz");
const deleteQuiz = require("./api/Remove Quiz")
const getNoCorrectAnswersQuiz = require("./api/Get Quiz (No correct answer)");
const getCorrectAnswersQuiz = require("./api/Get Quiz (Correct Answers)");
const getUserResult = require("./api/Get User Result");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use("/api" , getQuizzes);
app.use("/api" , createQuiz);
app.use("/api" , getQuizDetails);
app.use("/api" , submit);
app.use("/api" , getQuiz)
app.use("/api" , updateQuiz)
app.use("/api" , deleteQuiz);
app.use("/api" , getNoCorrectAnswersQuiz);
app.use("/api" , getCorrectAnswersQuiz);
app.use("/api" , getUserResult);

app.listen(PORT, () => console.log("Server Is Running On Port " + PORT));

module.exports = app;
module.exports.handler = serverless(app);