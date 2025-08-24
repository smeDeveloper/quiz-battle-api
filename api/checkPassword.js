const router = require("express").Router();
const mongoose = require("mongoose");
const { compare } = require("bcrypt");

require("dotenv").config();

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

router.post("/check-password" , async (req , res) => {
    const { userPassword , quizID } = req.body;
    if(!quizID) return res.json({failed: true, msg: "There is no quiz id",});

    try {
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