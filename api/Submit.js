const express = require("express");
const router = express.Router();
const connectDB = require("../connectMongoDB");
const Result = require("../models/result");

require("dotenv").config();

router.post("/submit", async (req, res) => {
    const { answers, quiz_id, user_id, user_name, points } = req.body;

    
    try {
        await connectDB();
        const newResult = new Result({ quiz_id, name: user_name, id: user_id, answers, points });
        await newResult.save();
    } catch (err) {
        res.json({ failed: true, })
    }

    res.json({ saved: true, });
})

module.exports = router;