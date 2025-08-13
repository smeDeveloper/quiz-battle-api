const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

const getQuizzes = require("./router/Get Quizzes");
const createQuiz = require("./router/Create Quiz");
const getQuizDetails = require("./router/Get Quiz Details");
const submit = require("./router/Submit");
const getQuiz = require("./router/Get Quiz");
const updateQuiz = require("./router/Update Quiz");
const deleteQuiz = require("./router/Remove Quiz")
const getNoCorrectAnswersQuiz = require("./router/Get Quiz (No correct answer)");
const getCorrectAnswersQuiz = require("./router/Get Quiz (Correct Answers)");
const getUserResult = require("./router/Get User Result");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({origin: "http://localhost:3000",}));

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