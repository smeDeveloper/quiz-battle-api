const express = require("express");
const redis = require("redis");
const router = express.Router();

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

const Quiz = require("../models/quiz");

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

router.put("/edit", async (req, res) => {
    const { quizID, userID, data } = req.body;

    try {
        const quiz = await Quiz.findById(quizID).lean();
        if (!quiz) return res.json({ failed: true, msg: "Quiz is not found.", });
        if (quiz.from_id !== userID) return res.json({ failed: true, msg: "Only the quiz creator can update this quiz.", });

        await Quiz.updateOne({ _id: quizID, }, { $set: data, });

        let cachedQuizzes = await redisClient.get("quizzes");

        if (cachedQuizzes) {
            cachedQuizzes = JSON.parse(cachedQuizzes);
        } else {
            let quizzes = await Quiz.find({}).lean();
            quizzes.map(quiz => {
                const quizID = `${quiz._id}`.split("new ObjectId('").pop().split("')").shift();
                return { ...quiz, _id: quizID, };
            })
            cachedQuizzes = quizzes;
        }

        const quizIndex = cachedQuizzes.findIndex(quiz => quiz._id === quizID);
        cachedQuizzes[quizIndex] = { ...cachedQuizzes[quizIndex], category: data.category, description: data.description, from_name: data.from_name, };

        await redisClient.set("quizzes", JSON.stringify(cachedQuizzes));

        res.json({ msg: "Quiz updated successfully.", });
    } catch (err) {
        res.json({ failed: true, msg: "Failed to update the quiz.", })
    }

})

module.exports = router;