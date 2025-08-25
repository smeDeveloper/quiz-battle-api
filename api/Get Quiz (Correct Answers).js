const router = require("express").Router();
const connectDB = require("../connectMongoDB");
require("dotenv").config();

const Quiz = require("../models/quiz");

router.get("/quiz/with-answers/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await connectDB();
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