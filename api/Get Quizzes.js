const express = require("express");
const redis = require("redis");
const Quiz = require("../models/quiz");

const router = express.Router();

require("dotenv").config();

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },

});

redisClient.connect()
    .then(() => console.log("CONNECTED TO REDIS"))
    .catch((err) => console.error("FAILED TO CONNECT TO REDIS:", err));

router.get("/quiz", async (req, res) => {
    try {
        const cachedQuizzes = await redisClient.lRange("quizzes", 0, -1);
        if (cachedQuizzes.length) {
            const parsedQuizzes = cachedQuizzes.map(q => JSON.parse(q));
            const newQuizzes = parsedQuizzes.map(quiz => {
                if (typeof quiz === "string") quiz = JSON.parse(quiz);
                const updatedQuiz = { ...quiz };
                updatedQuiz.questions = quiz.questions.map(question => {
                    question.question = ""
                    question.answers = [];
                    question.correctAnswer = "";
                    return { question: question.question, answers: question.answers, correctAnswer: question.correctAnswer, };
                })
                return updatedQuiz;
            })
            return res.json({ msg: "fetched", quizzes: newQuizzes });
        }

        const quizzes = await Quiz.find({}).lean();
        for (const quiz of quizzes) {
            await redisClient.rPush("quizzes", JSON.stringify(quiz));
        }
        await redisClient.expire("quizzes", 900);

        const newQuizzes = quizzes.map(quiz => {
            const updatedQuiz = { ...quiz };
            updatedQuiz.questions = quiz.questions.map(question => {
                question.question = ""
                question.answers = [];
                question.correctAnswer = "";
                return { question: question.question, answers: question.answers, correctAnswer: question.correctAnswer, };
            })
            return updatedQuiz;
        })

        res.json({ msg: "fetched", quizzes: newQuizzes, });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to fetch quizzes", error: err.message });
    }
});

module.exports = router;