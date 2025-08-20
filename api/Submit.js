const express = require("express");
const router = express.Router();

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL_CONNECTION)
    .then(() => console.log("CONNECTED TO MONGODB"))
    .catch((err) => console.error("FAILED TO CONNECT TO MONGODB:", err));

const Result = require("../models/result");

router.post("/submit", async (req, res) => {
    const { answers, quiz_id, user_id, user_name, points } = req.body;

    const newResult = new Result({ quiz_id, name: user_name, id: user_id, answers, points });

    try {
        await newResult.save();
    } catch (err) {
        res.json({failed: true,})
    }

    res.json({saved: true,});
})

module.exports = router;