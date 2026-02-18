const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  
  // 🟢 ADD THIS LINE HERE
  tags: [{ type: String }], 
  
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Problem", ProblemSchema);