const router = require("express").Router();
const connectDB = require("../connectMongoDB");
const { compare } = require("bcrypt");


const Quiz = require("../models/quiz");

router.post("/check-password" , async (req , res) => {
    const { userPassword , quizID } = req.body;
    if(!quizID) return res.json({failed: true, msg: "There is no quiz id",});

    try {
        await connectDB();
        const quiz = await Quiz.findById(quizID).lean();
        if(!quiz) return res.json({failed: true ,msg: "Quiz is not found in the database.",});
        const passwordMatches = await compare(userPassword , quiz.password);
        res.json({matches: passwordMatches,})
    }catch (err) {
        console.log(err);
        res.json({failed: true, msg: "Oops! something went wrong while checking your password.",})
    }
})

module.exports = router;