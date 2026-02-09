const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        default: "Medium" // Easy, Medium, Hard
    },
    testCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model("Problem", ProblemSchema);