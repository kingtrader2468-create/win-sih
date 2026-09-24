import { useState } from 'react';
import { CheckCircle2, ShieldCheck, RotateCcw, Award, X } from 'lucide-react';
import { completeQuiz } from '../services/apiClient.js';
import './QuizCard.css';

function QuizCard({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (Object.keys(answers).length !== quiz.questions.length) {
      const unanswered = quiz.questions.length - Object.keys(answers).length;
      setError(`Please answer every question before submitting. ${unanswered} question${unanswered === 1 ? '' : 's'} remaining.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = await completeQuiz(
        quiz._id,
        quiz.questions.map((_, index) => answers[index])
      );
      setResult(data);
      setShowResultModal(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setShowResultModal(false);
    setAnswers({});
    setError('');
  }

  if (result) {
    return (
      <>
        {showResultModal && (
          <div className="quiz-result-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="quiz-result-title">
            <div className="quiz-result-modal">
              <button className="quiz-result-modal__close" type="button" onClick={() => setShowResultModal(false)} aria-label="Close quiz result">
                <X size={18} />
              </button>
              <CheckCircle2 className="quiz-result-modal__icon" size={38} aria-hidden="true" />
              <p className="eyebrow">Quiz Complete</p>
              <h2 id="quiz-result-title">Your Polar Science Result</h2>
              <strong className="quiz-result-modal__score">{result.score}%</strong>
              <div className="quiz-result-modal__counts">
                <div className="quiz-result-modal__count quiz-result-modal__count--correct">
                  <strong>{result.correctAnswers}</strong>
                  <span>Correct</span>
                </div>
                <div className="quiz-result-modal__count quiz-result-modal__count--wrong">
                  <strong>{result.totalQuestions - result.correctAnswers}</strong>
                  <span>Wrong</span>
                </div>
                <div className="quiz-result-modal__count">
                  <strong>{result.totalQuestions}</strong>
                  <span>Total</span>
                </div>
              </div>
              <button className="button button--primary" type="button" onClick={() => setShowResultModal(false)}>
                Review Answers
              </button>
            </div>
          </div>
        )}
        <section className="quiz-card quiz-card--completed">
        <div className="quiz-card__header">
          <div className="quiz-score-badge">
            <CheckCircle2 aria-hidden="true" size={24} />
            <div>
              <p className="eyebrow">Formative Diagnostic Result</p>
              <h2>Scientific Evaluation: {result.score}%</h2>
            </div>
          </div>
          <span className="quiz-governance-tag">
            <ShieldCheck size={13} /> MoES Accredited Evaluation
          </span>
        </div>

        <p className="quiz-score-summary">
          {result.correctAnswers} of {result.totalQuestions} empirical deductions confirmed. +{result.correctAnswers + 5} XP minted to Scholar Registry.
        </p>

        {result.awardedBadges?.length > 0 && (
          <div className="quiz-badge-award">
            <Award size={18} />
            <span>Badge Earned: <strong>{result.awardedBadges.join(', ')}</strong></span>
          </div>
        )}

        {/* DIAGNOSTIC FEEDBACK BREAKDOWN */}
        <div className="quiz-diagnostic-list">
          <h3 className="diagnostic-heading">Diagnostic Scientific Notes</h3>
          {result.diagnosticFeedback ? (
            result.diagnosticFeedback.map((item, idx) => (
              <div
                key={idx}
                className={`diagnostic-card ${item.isCorrect ? 'diagnostic-card--correct' : 'diagnostic-card--divergent'}`}
              >
                <div className="diagnostic-card__header">
                  <span className="diagnostic-num">Question {item.index}</span>
                  <span className={`diagnostic-status ${item.isCorrect ? 'status-pass' : 'status-review'}`}>
                    {item.isCorrect ? '✓ Empirically Verified' : '⚠ Diagnostic Divergence'}
                  </span>
                </div>
                <p className="diagnostic-prompt">{item.prompt}</p>
                <div className="diagnostic-answers">
                  <div className="answer-row">
                    <span className="answer-label">Your Deduction:</span>
                    <span className={`answer-val ${item.isCorrect ? 'val-correct' : 'val-divergent'}`}>
                      {item.selectedAnswer}
                    </span>
                  </div>
                  {!item.isCorrect && (
                    <div className="answer-row">
                      <span className="answer-label">Empirical Observation:</span>
                      <span className="answer-val val-ground-truth">{item.correctAnswer}</span>
                    </div>
                  )}
                </div>
                <div className="diagnostic-note">
                  <strong>Scientific Context:</strong> {item.diagnosticNote}
                </div>
              </div>
            ))
          ) : (
            <ol className="diagnostic-fallback-list">
              {result.explanations?.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ol>
          )}
        </div>

        <button className="button button--secondary" onClick={handleReset} type="button" style={{ marginTop: '20px' }}>
          <RotateCcw size={14} /> Retake Diagnostic Evaluation
        </button>
        </section>
      </>
    );
  }

  return (
    <form className="quiz-card" onSubmit={submit}>
      <div className="quiz-card__eyebrow-row">
        <p className="eyebrow">Formative Knowledge Evaluation</p>
        <span className="quiz-standard-tag">Pedagogical Standard: Diagnostic Review</span>
      </div>
      <h2>{quiz.title}</h2>
      <p className="quiz-description">{quiz.description}</p>

      {quiz.questions.map((question) => (
        <fieldset key={question.index} className="quiz-fieldset">
          <legend className="quiz-legend">
            <span className="quiz-qnum">{question.index + 1}</span> {question.prompt}
          </legend>
          <div className="quiz-options-group">
            {question.options.map((option) => (
              <label
                key={option}
                className={`quiz-option-label ${answers[question.index] === option ? 'quiz-option-label--selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question.index}`}
                  checked={answers[question.index] === option}
                  onChange={() => setAnswers((current) => ({ ...current, [question.index]: option }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && <p className="feedback feedback--incorrect">{error}</p>}

      <button className="button button--primary quiz-submit-btn" disabled={submitting} type="submit" style={{ marginTop: '20px' }}>
        {submitting ? 'Evaluating Deductions...' : 'Submit Scientific Evaluation'}
      </button>
    </form>
  );
}

export default QuizCard;
