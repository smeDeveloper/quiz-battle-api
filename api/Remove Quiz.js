const express = require("express");
const Quiz = require("../models/quiz")
const router = express.Router();
const redis = require("redis");
const Result = require("../models/result");

require("dotenv").config();

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
    
});

redisClient.connect()
    .then(() => console.log("CONNECTED TO REDIS"))
    .catch((err) => console.error("FAILED TO CONNECT TO REDIS:", err));

router.delete("/delete" , async (req , res) => {
    const { quizID , userID } = req.body;

    try {
        const quiz = await Quiz.findById(quizID).lean();
        if(quiz) {
            if(quiz.from_id !== userID) return res.json({failed: true, msg: "Only the quiz creator can delete this quiz.",});
            let cachedQuizzes = await redisClient.lRange("quizzes" , 0 , -1);
            if(cachedQuizzes.length) {
                cachedQuizzes = cachedQuizzes.map(quiz => JSON.parse(quiz));
                const quizIndex = cachedQuizzes.findIndex(quiz => quiz._id === quizID);
                cachedQuizzes.splice(quizIndex , 1);
                await redisClient.del("quizzes");
                for(let i = 0; i < cachedQuizzes.length; i++) {
                    await redisClient.rPush("quizzes" , JSON.stringify(cachedQuizzes[i]));
                }

                await redisClient.expire("quizzes" , 900);

                const cachedQuiz = redisClient.get(`quiz:${quizID}`);
                if(cachedQuiz) {
                    await redisClient.del(`quiz:${quizID}`);
                }

                await Quiz.deleteOne({_id: quizID,});
                await Result.deleteMany({quiz_id: quizID,});
                res.json({msg: "Quiz deleted successfully!",});
            }else {
                await Quiz.deleteOne({_id: quizID,});
                await Result.deleteMany({quiz_id: quizID,});
                res.json({msg: "Quiz deleted successfully!"});
            }
        }else {
            return res.json({failed: true, msg: "Quiz is not found",});
        }
    }catch (err) {
        console.log(err);
        res.json({failed: true, msg: "Oops! something went wrong while deleting your quiz",});
    }

})

module.exports = router;