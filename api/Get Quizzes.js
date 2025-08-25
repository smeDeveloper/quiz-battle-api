const express = require("express");
const redis = require("redis");
const connectDB = require("../connectMongoDB")
const router = express.Router();

require("dotenv").config();
const Quiz = require("../models/quiz");

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Too many retries');
            return Math.min(retries * 50, 500); 
        }
    },

});

redisClient.connect()
    .then(() => console.log("✅ CONNECTED TO REDIS"))
    .catch((err) => console.error("FAILED TO CONNECT TO REDIS:", err));

redisClient.on("error" , (err) => {
    console.log("REDIS CONNECTION ERROR:" , err);
})

router.get("/quiz", async (req, res) => {
    try {
        let cachedQuizzes = await redisClient.get("quizzes");
        if (cachedQuizzes) {
            cachedQuizzes = JSON.parse(cachedQuizzes);
            const newQuizzes = cachedQuizzes.map(quiz => {
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

        await connectDB();
        const quizzes = await Quiz.find({}).lean();
        await redisClient.set("quizzes", JSON.stringify(quizzes))

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