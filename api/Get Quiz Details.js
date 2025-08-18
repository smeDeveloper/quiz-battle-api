const express = require("express");
const router = express.Router();
const Quiz = require("../models/quiz");
const Result = require("../models/result");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

router.post("/results" , async (req , res) => {
    const { user_id , quizID } = req.body;
    let quizData = {};
    let studentsResults = {};

    try {
        quizData = await Quiz.findById(quizID).lean();
        studentsResults = await Result.find({quiz_id: quizID,}).lean();
        if(quizData.from_id !== user_id) return res.json({fetched: false, msg: "Only the teacher of this quiz can access the results of this quiz.",})
        res.json({quizData: quizData, studentsResults: studentsResults,});
    }catch (err) {
        res.json({fetched: false, msg: "Failed to fetch the details of this quiz.",});
    }

})

module.exports = router;