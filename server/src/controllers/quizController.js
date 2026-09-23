const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { awardEligibleBadges } = require('../services/progressService');

async function getProgressRecord(request) {
  const userId = request.user?._id;
  if (userId) {
    return UserProgress.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId } }, { new: true, upsert: true });
  }
  const user = await User.findOne({ email: 'demo@polar-india-hub.local' }) || await User.findOne();
  if (!user) throw new Error('Demo student session is unavailable. Run the development seed first.');
  return UserProgress.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { new: true, upsert: true });
}

async function listQuizzes(request, response) {
  try {
    const quizzes = await Quiz.find({ status: { $in: ['published', 'prototype-demo'] } })
      .populate('researchResource', 'title region year')
      .lean();

    const formatted = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      researchResource: q.researchResource,
      questionCount: q.questions?.length || 0
    }));

    return response.json({ quizzes: formatted, total: formatted.length });
  } catch (error) {
    console.error('Error listing quizzes:', error);
    return response.status(500).json({ error: { message: 'Failed to list quizzes.' } });
  }
}

async function getQuizById(request, response) {
  try {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: { message: 'Invalid quiz ID format.' } });
    }
    const quiz = await Quiz.findById(id).populate('researchResource', 'title region year').lean();
    if (!quiz) return response.status(404).json({ error: { message: 'Quiz not found.' } });

    const questions = (quiz.questions || []).slice(0, 5).map(({ prompt, options, explanation }, index) => ({
      index,
      prompt,
      options,
      explanation
    }));

    return response.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        researchResource: quiz.researchResource,
        questions
      }
    });
  } catch (error) {
    return response.status(500).json({ error: { message: 'Failed to retrieve quiz.' } });
  }
}

async function getQuizForResearch(request, response) {
  const quiz = await Quiz.findOne({ researchResource: request.params.resourceId, status: { $in: ['published', 'prototype-demo'] } }).lean();
  if (!quiz) return response.status(404).json({ error: { message: 'No quiz is available for this research resource.' } });
  const questions = (quiz.questions || []).slice(0, 5).map(({ prompt, options, explanation }, index) => ({ index, prompt, options, explanation }));
  return response.json({ quiz: { _id: quiz._id, title: quiz.title, description: quiz.description, questions } });
}

async function completeQuiz(request, response) {
  const quiz = await Quiz.findById(request.params.quizId).lean();
  if (!quiz) return response.status(404).json({ error: { message: 'Quiz not found.' } });
  const answers = Array.isArray(request.body.answers) ? request.body.answers : [];
  const questions = (quiz.questions || []).slice(0, 5);
  const correctAnswers = questions.filter((question, index) => answers[index] === question.answer).length;
  const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  const progress = await getProgressRecord(request);
  const alreadyCompleted = progress.quizzesCompleted.some((item) => String(item.quiz) === String(quiz._id));
  if (!alreadyCompleted) {
    progress.quizzesCompleted.push({ quiz: quiz._id, completedAt: new Date(), score });
    progress.xp += 5 + correctAnswers;
  }
  const awardedBadges = await awardEligibleBadges(progress);
  await progress.save();

  const diagnosticFeedback = questions.map((question, index) => {
    const isCorrect = answers[index] === question.answer;
    return {
      index: index + 1,
      prompt: question.prompt,
      selectedAnswer: answers[index] || 'No answer selected',
      correctAnswer: question.answer,
      isCorrect,
      diagnosticNote: question.explanation || (isCorrect ? 'Accurate deduction matching empirical records.' : 'Review linked research resource and mooring CTD telemetry.'),
      conceptDomain: 'Cryospheric Science & Polar Telemetry'
    };
  });

  return response.json({
    score,
    correctAnswers,
    totalQuestions: questions.length,
    explanations: questions.map((question) => question.explanation),
    diagnosticFeedback,
    xp: progress.xp,
    awardedBadges: awardedBadges.map((badge) => badge.name)
  });
}

module.exports = { listQuizzes, getQuizById, getQuizForResearch, completeQuiz };
