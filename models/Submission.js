const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem', // Links this submission to a specific Problem
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: "cpp"
    },
    verdict: {
        type: String, // "Accepted", "Wrong Answer", "Error"
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now // Auto-fills the current time
    }
});

module.exports = mongoose.model("Submission", SubmissionSchema);