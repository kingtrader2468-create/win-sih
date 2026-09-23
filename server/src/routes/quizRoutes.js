const express = require('express');
const { listQuizzes, getQuizById, getQuizForResearch, completeQuiz } = require('../controllers/quizController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', listQuizzes);
router.get('/:id', getQuizById);
router.get('/research/:resourceId', getQuizForResearch);
router.post('/:quizId/complete', optionalAuth, completeQuiz);

module.exports = router;
