const router = require("express").Router();
const Quiz = require("../models/quiz");

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