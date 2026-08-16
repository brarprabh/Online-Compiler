const express = require('express');
const verifyToken = require('../middleware/auth');
const {
  getProblems,
  getProblemById,
  runCode,
  submitCode,
  getSubmissionsByProblem,
  getLeaderboard,
  getProfile,
} = require('../controllers/problemController');

const router = express.Router();

router.get('/problems', getProblems);
router.get('/problems/:id', getProblemById);
router.post('/run', runCode);
router.post('/submit', verifyToken, submitCode);
router.get('/submissions/:id', verifyToken, getSubmissionsByProblem);
router.get('/leaderboard', getLeaderboard);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
