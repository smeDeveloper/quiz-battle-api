const express = require("express");
const redis = require("redis");
const router = express.Router();
const Quiz = require("../models/quiz");

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

router.put("/edit", async (req, res) => {
    const { quizID, userID, data } = req.body;

    try {
        const quiz = await Quiz.findById(quizID);
        if (!quiz) return res.json({ failed: true, msg: "Quiz is not found.", });
        if (quiz.from_id !== userID) return res.json({ failed: true, msg: "Only the quiz creator can update this quiz.", });

        await Quiz.updateOne({ _id: quizID, }, { $set: data, });

        let cachedQuizzes = await redisClient.lRange("quizzes", 0, -1);

        if (cachedQuizzes.length) {
            cachedQuizzes = cachedQuizzes.map(q => JSON.parse(q));
        } else {
            let quizzes = await Quiz.find({});
            quizzes.map(quiz => {
                const quizID = `${quiz._id}`.split("new ObjectId('").pop().split("')").shift();
                console.log(quizID);
                return { ...quiz , _id: quizID,};
            })
            cachedQuizzes = quizzes;
        }        

        const quizIndex = cachedQuizzes.findIndex(quiz => quiz._id === quizID);
        cachedQuizzes[quizIndex] = { ...cachedQuizzes[quizIndex], category: data.category, description: data.description, };

        await redisClient.del("quizzes");
        for (let i = 0; i < cachedQuizzes.length; i++) {
            await redisClient.rPush("quizzes", JSON.stringify(cachedQuizzes[i]));
        }
        await redisClient.expire("quizzes", 900);

        res.json({ msg: "Quiz updated successfully.", });
    } catch (err) {
        res.json({ failed: true, msg: "Failed to update the quiz.", })
    }

})

module.exports = router;