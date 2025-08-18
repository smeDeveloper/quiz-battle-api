const router = require("express").Router();
const Result = require("../models/result");
const Quiz = require("../models/quiz");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

router.post("/result" , async (req , res) => {
    const { quizID , userID } = req.body;

    try {
        const quizQuestions = await Quiz.findById(quizID , { category: 0 , from_name: 0, from_id: 0, description: 0, createdAt: 0,}).lean();
        const result = await Result.find({id: userID, quiz_id: quizID,}).lean();

        res.json({quizQuestions , result: result[0]})
    }catch (err) {
        console.log(err);
        res.json({failed: true, msg: "Oops! something went wrong while fetching your result.",})
    }
})

module.exports = router;