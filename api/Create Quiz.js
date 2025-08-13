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


router.post("/quiz", async (req, res) => {
    const { questions, from_id, from_name, description, category } = req.body;
    if (questions.length > 2) {
        try {
            const saveQuiz = new Quiz({ category, from_id, from_name, description, questions });
            await saveQuiz.save();

            const allQuizzes = await Quiz.find({});

            await redisClient.del("quizzes");
            for (let i = 0; i < allQuizzes.length; i++) {
                await redisClient.rPush("quizzes", JSON.stringify(allQuizzes[i]));
            }

            await redisClient.expire("quizzes", 900);

            res.status(201).json({
                msg: "Quiz has been created successfully!",
                saved: true,
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({
                msg: "Quiz creation failed due to invalid or missing fields.",
                title: "Validation Error"
            });
        }
    }else {
        res.status(400).json({msg: "Sorry, your quiz must contain at least 3 questions.",})
    }
});

module.exports = router;