const router = require("express").Router();
const mongoose = require("mongoose");
const redis = require("redis");
const { genSalt, hash } = require("bcrypt");

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
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Too many retries');
            return Math.min(retries * 50, 500);
        }
    },
});

redisClient.connect()
    .then(() => console.log("✅ CONNECTED TO REDIS"))
    .catch((err) => console.error("FAILED TO CONNECT TO REDIS:", err));


router.put("/change-password", async (req, res) => {
    const { quizID, userID, newPassword } = req.body;
    if (!quizID || !userID) return res.json({ failed: true, msg: "Missing the quiz id or the user id", });

    const changePassword = async (password) => {
        await Quiz.findByIdAndUpdate(quizID, { $set: { password: password, }, });
        const cachedQuizzes = JSON.parse(await redisClient.get("quizzes"));
        const newQuizzes = cachedQuizzes.map(quiz => {
            const newQuiz = { ...quiz };
            if (quiz._id === quizID) {
                newQuiz.password = password;
            }
            return newQuiz;
        })
        await redisClient.set("quizzes", JSON.stringify(newQuizzes));
        await redisClient.setEx(`quiz:${quizID}`, 900, JSON.stringify(newQuizzes.find(quiz => quiz._id === quizID)));
        res.json({ changed: true, password: password, });
    }

    try {
        const quiz = await Quiz.findById(quizID).lean();
        if (!quiz) return res.json({ failed: true, msg: "Quiz is not found in the database.", });
        if (quiz.from_id !== userID) return res.json({ failed: true, msg: "Only the quiz creator can change the password of the quiz.", });
        if (!newPassword) {
            changePassword("");
        } else {
            const salt = await genSalt(10);
            const hashedPassword = await hash(newPassword, salt);
            changePassword(hashedPassword);

        }
    } catch (err) {
        console.log(err);
        res.json({ failed: true, msg: "Oops! something went wrong while updating the password.", });
    }
})

module.exports = router;