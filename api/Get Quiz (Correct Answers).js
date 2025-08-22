const router = require("express").Router();

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

router.get("/quiz/with-answers/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const questions = await Quiz.findById(id, { 'questions.correctAnswer': 1, }).lean();
        const correctAnswers = [];
        for (let i = 0; i < questions.questions.length; i++) {
            correctAnswers.push(questions.questions[i].correctAnswer);
        }
        res.json({ correctAnswers });
    } catch (err) {
        console.log(err);
        res.json({ failed: true, msg: "Something went wrong", });
    }

})

module.exports = router;