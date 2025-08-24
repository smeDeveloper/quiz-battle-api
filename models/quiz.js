const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    category: { 
        type: String, 
        required: true, 
        enum: {
            values: ["Math" , "Science" , "Arabic" , "English" , "Social Studies" , "French"], 
            message: "You must use a category from one of these values Math , Arabic , English , Science , Social Studies, French.",
        },
    },
    from_name: {
        type: String,
        required: true,  
    },
    from_id: {
        type: String,
        required: true,
    },
    questions: [
        {
            question: String,
            answers: [String],
            correctAnswer: String,
        }
    ],
    description: { 
        type: String, 
        default: "",
    },
    createdAt: { 
        type: Date, 
        default: Date.now(),
    },
    password: { 
        type: String, 
        default: "",
    },
} , {
    collection: "quizzes",
});

const Quiz = mongoose.model("Quiz" , quizSchema);

module.exports = Quiz;