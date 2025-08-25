const express = require("express");
const bcrypt = require("bcrypt");
const redis = require("redis");
const connectDB = require("../connectMongoDB");

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


router.post("/quiz", async (req, res) => {
    const { questions, from_id, from_name, description, category, password } = req.body;
    if (questions.length > 2) {
        try {
            await connectDB();
            let hashedPassword = "";
            const salt = password.trim() ? await bcrypt.genSalt(10) : "";
            hashedPassword = password.trim() ? await bcrypt.hash(password, salt) : "";
            const saveQuiz = new Quiz({ category, from_id, from_name, description, questions, password: hashedPassword });
            const savedQuiz = await saveQuiz.save();
            const quizID = `${savedQuiz._id}`.split("new ObjectId('").pop().split("')").shift();

            let cachedQuizzes = await redisClient.get("quizzes");
            if (cachedQuizzes) cachedQuizzes = JSON.parse(cachedQuizzes);
            cachedQuizzes.push(saveQuiz);

            await redisClient.set("quizzes", JSON.stringify(cachedQuizzes));

            res.status(201).json({
                msg: "Quiz has been created successfully!",
                id: quizID,
                saved: true,
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({
                msg: "Quiz creation failed due to invalid or missing fields.",
                title: "Validation Error"
            });
        }
    } else {
        res.status(400).json({ msg: "Sorry, your quiz must contain at least 3 questions.", })
    }
});

module.exports = router;