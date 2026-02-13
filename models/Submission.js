const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    // 👇 WE MUST ADD THIS LINE 👇
    userId: { 
        type: String, 
        required: true 
    },
    // -------------------------
    problemId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'cpp'
    },
    verdict: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', SubmissionSchema);