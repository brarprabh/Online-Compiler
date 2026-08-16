const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { generateFile } = require('../../compiler/generateFile');
const { executeCpp } = require('../../compiler/executeCpp');
const { generateInputFile } = require('../../compiler/generateInputFile');

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const runCode = async (req, res) => {
  const { language = 'cpp', code, input, expectedOutput } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Empty code body!' });
  }

  try {
    const filepath = await generateFile(language, code);
    const inputPath = await generateInputFile(input);
    const output = await executeCpp(filepath, inputPath);

    let verdict = null;
    if (expectedOutput) {
      const cleanOutput = output.trim().replace(/\r\n/g, '\n');
      const cleanExpected = expectedOutput.trim().replace(/\r\n/g, '\n');

      verdict = cleanOutput === cleanExpected ? 'Accepted' : 'Wrong Answer';
    }

    res.json({ output, verdict });
  } catch (err) {
    if (err === 'Time Limit Exceeded (TLE)') {
      return res.status(408).json({
        success: false,
        error: 'Time Limit Exceeded',
        verdict: 'TLE',
      });
    }

    res.status(500).json({
      success: false,
      error: err.message || err,
      verdict: 'Runtime Error',
    });
  }
};

const submitCode = async (req, res) => {
  try {
    const { problemId, code, language, verdict } = req.body;

    const newSubmission = new Submission({
      userId: req.user.id,
      problemId,
      code,
      language,
      verdict,
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Submission saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSubmissionsByProblem = async (req, res) => {
  try {
    const problemId = req.params.id;
    const history = await Submission.find({
      problemId,
      userId: req.user.id,
    }).sort({ submittedAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { verdict: 'Accepted' } },
      {
        $group: {
          _id: '$userId',
          solvedCount: { $addToSet: '$problemId' },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalSolved: { $size: '$solvedCount' },
        },
      },
      {
        $addFields: {
          userIdObj: { $toObjectId: '$userId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObj',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { totalSolved: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          username: { $ifNull: ['$userDetails.username', 'Unknown User'] },
          totalSolved: 1,
        },
      },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const solvedProblems = await Submission.distinct('problemId', {
      userId: req.user.id,
      verdict: 'Accepted',
    });
    const totalAttempts = await Submission.countDocuments({ userId: req.user.id });

    res.json({
      username: user.username,
      email: user.email,
      solvedCount: solvedProblems.length,
      totalAttempts,
      solvedProblems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  runCode,
  submitCode,
  getSubmissionsByProblem,
  getLeaderboard,
  getProfile,
};
