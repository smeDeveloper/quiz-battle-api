const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    quiz_id: {
        type: String,
        required: true , 
    },
    name: { 
        type: String, 
        required: true,
    }, 
    id: {
        type: String,
        required: true,
    },
    answers: {
        type: Array,
        required: true,
    },
    points: { type: Number,},
}, {
    collection: "results",
});

const Result = mongoose.model("Result" , resultSchema);

module.exports = Result;