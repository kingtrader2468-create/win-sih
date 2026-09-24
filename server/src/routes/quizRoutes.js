const express = require('express');
const { listQuizzes, getQuizById, getQuizByLevel, getQuizForResearch, completeQuiz } = require('../controllers/quizController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', listQuizzes);
router.get('/research/:resourceId', getQuizForResearch);
router.get('/level/:level', getQuizByLevel);
router.get('/:id', getQuizById);
router.post('/:quizId/complete', optionalAuth, completeQuiz);

module.exports = router;
