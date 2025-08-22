const express = require("express");
const router = express.Router();
const redis = require("redis");


require("dotenv").config();

const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

const Quiz = require("../models/quiz")
const Result = require("../models/result");

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

router.delete("/delete", async (req, res) => {
    const { quizID, userID } = req.body;

    try {
        const quiz = await Quiz.findById(quizID).lean();
        if (quiz) {
            if (quiz.from_id !== userID) return res.json({ failed: true, msg: "Only the quiz creator can delete this quiz.", });
            let cachedQuizzes = await redisClient.get("quizzes");
            if (cachedQuizzes) {
                cachedQuizzes = JSON.parse(cachedQuizzes);
                const quizIndex = cachedQuizzes.findIndex(quiz => quiz._id === quizID);
                cachedQuizzes.splice(quizIndex, 1);
                await redisClient.set("quizzes", JSON.stringify(cachedQuizzes));

                const cachedQuiz = redisClient.get(`quiz:${quizID}`);
                if (cachedQuiz) {
                    await redisClient.del(`quiz:${quizID}`);
                }

                await Quiz.deleteOne({ _id: quizID, });
                await Result.deleteMany({ quiz_id: quizID, });
                res.json({ msg: "Quiz deleted successfully!", });
            } else {
                await Quiz.deleteOne({ _id: quizID, });
                await Result.deleteMany({ quiz_id: quizID, });
                res.json({ msg: "Quiz deleted successfully!" });
            }
        } else {
            return res.json({ failed: true, msg: "Quiz is not found", });
        }
    } catch (err) {
        console.log(err);
        res.json({ failed: true, msg: "Oops! something went wrong while deleting your quiz", });
    }

})

module.exports = router;