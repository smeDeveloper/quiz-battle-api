const router = require("express").Router();

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

const Quiz = require("../models/quiz");

router.get("/quiz/with-answers/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const questions = await Quiz.findById(id , {'questions.correctAnswer': 1,}).lean();
        const correctAnswers = [];
        for(let i = 0; i < questions.questions.length; i++) {
            correctAnswers.push(questions.questions[i].correctAnswer);
        }
        res.json({correctAnswers});
    } catch (err) {
        console.log(err);
        res.json({failed: true,msg: "Something went wrong",});
    }

})

module.exports = router;