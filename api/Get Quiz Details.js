const express = require("express");
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
const Result = require("../models/result");

router.post("/results", async (req, res) => {
    const { user_id, quizID } = req.body;
    let quizData = {};
    let studentsResults = {};

    try {
        quizData = await Quiz.findById(quizID).lean();
        studentsResults = await Result.find({ quiz_id: quizID, }).lean();
        if (quizData.from_id !== user_id) return res.json({ fetched: false, msg: "Only the teacher of this quiz can access the results of this quiz.", })
        res.json({ quizData: quizData, studentsResults: studentsResults, });
    } catch (err) {
        res.json({ fetched: false, msg: "Failed to fetch the details of this quiz.", });
    }

})

module.exports = router;