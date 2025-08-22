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

router.get("/quiz/no-correct-answer/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const quiz = await Quiz.findById(id).lean();
        const newQuiz = {
            ...quiz,
            questions: quiz.questions.map(question => ({
                correctAnswer: "",
                question: question.question,
                answers: question.answers,
            })),
        }
        res.json(newQuiz);
    } catch (err) {
        console.log(err);
        res.json({ failed: true, msg: "Something wrong occured while fetching the quiz.", })
    }

})

module.exports = router;