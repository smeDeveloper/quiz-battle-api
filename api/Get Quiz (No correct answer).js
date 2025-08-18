const router = require("express").Router();
const Quiz = require("../models/quiz");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

router.get("/quiz/no-correct-answer/:id" , async (req , res) => {
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
        res.json({failed: true, msg: "Something wrong occured while fetching the quiz.",})
    }

})

module.exports = router;