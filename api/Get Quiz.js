const express = require("express");
const router = express.Router();
const redis = require("redis");
const Quiz = require("../models/quiz");

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

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