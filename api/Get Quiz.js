const express = require("express");
const router = express.Router();
const redis = require("redis");
const connectDB = require("../connectMongoDB")

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

router.get("/quiz/:id", async (req, res) => {
    const { id } = req.params;

    const cachedQuiz = await redisClient.get(`quiz:${id}`);
    if (cachedQuiz) {
        const quiz = JSON.parse(cachedQuiz)
        const newQuiz = {
            ...quiz,
            questions: quiz.questions.map(question => ({
                question: "",
                answers: [],
                correctAnswer: "",
            })),
        }
        return res.json(newQuiz)
    };

    try {
        await connectDB();
        const quiz = await Quiz.findById(id).lean();
        await redisClient.setEx(`quiz:${id}`, 900, JSON.stringify(quiz));
        const updatedQuiz = {
            ...quiz,
            questions: quiz.questions.map(question => ({
                ...question,
                answers: [],
                correctAnswer: "",
                question: ""
            }))
        };
        res.json(updatedQuiz);
    } catch (err) {
        console.log(err);
        res.json({ failed: true, msg: "Failed to fetch the quiz from the database", });
    }
})

module.exports = router;