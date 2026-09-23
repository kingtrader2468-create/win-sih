import { useEffect, useState } from 'react';
import {
  BookOpenText,
  CheckCircle2,
  Compass,
  Save,
  SearchCheck,
  ArrowRight,
  ShieldCheck,
  Workflow,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getMystery,
  getMysteryResult,
  saveMystery,
  submitMysteryAnswer,
  getQuizForResearch
} from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import QuizCard from '../components/QuizCard.jsx';
import './MysteryPage.css';

function MysteryPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginDemoScholar } = useAuth();
  const [payload, setPayload] = useState(null);
  const [result, setResult] = useState(null);
  const [choice, setChoice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const request = mode === 'result'
      ? getMysteryResult(id, controller.signal)
      : getMystery(id, controller.signal);

    request
      .then((data) => {
        if (!ignore) {
          if (mode === 'result') setResult(data);
          else setPayload(data);
          setStatus('success');
        }
      })
      .catch((requestError) => {
        if (!ignore && requestError.name !== 'AbortError') {
          setError(requestError.message);
          setStatus('error');
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id, mode, isAuthenticated]);

  useEffect(() => {
    if (mode !== 'result' || !result?.researchResource?._id) return undefined;
    let ignore = false;
    const controller = new AbortController();

    getQuizForResearch(result.researchResource._id, controller.signal)
      .then((data) => {
        if (!ignore) setQuiz(data.quiz);
      })
      .catch(() => {
        if (!ignore) setQuiz(null);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [mode, result]);

  async function toggleSave() {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/mystery/${id}`);
      return;
    }
    try {
      const response = await saveMystery(id);
      setPayload((current) => ({
        ...current,
        mystery: {
          ...current.mystery,
          progress: { ...current.mystery.progress, saved: response.saved }
        }
      }));
    } catch {
      // Ignore save error
    }
  }

  async function submitAnswer() {
    if (!choice) {
      setFeedback('Choose an evidence deduction to proceed.');
      return;
    }

    try {
      const response = await submitMysteryAnswer(id, choice);
      if (response.correct) {
        setFeedback('Evidence Confirmed');
        if (response.nextStep === 'result') {
          navigate(`/mystery/${id}/result`);
        } else {
          setPayload((current) => ({
            ...current,
            mystery: {
              ...current.mystery,
              progress: {
                ...current.mystery.progress,
                currentClue: response.currentClue
              }
            }
          }));
          setChoice('');
          setFeedback('');
        }
      } else {
        setFeedback(response.hint || 'Re-examine the linked research data.');
      }
    } catch (submitError) {
      setFeedback(submitError.message || 'Unable to verify deduction.');
    }
  }

  if (status === 'idle' || (status === 'loading' && !payload && !result)) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[360px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading polar investigation dossier…</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm">
            <div>
              <h2 className="font-headline-sm text-on-surface font-bold">Investigation Unavailable</h2>
              <p className="font-body-sm text-on-surface-variant mt-1">{error}</p>
            </div>
            <Link
              className="px-5 py-2 rounded-lg bg-surface-container-low text-primary font-label-md font-semibold hover:bg-surface-container transition-colors"
              to="/learning"
            >
              Continue Learning
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // 1. RESULT MODE
  if (mode === 'result') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
          <article className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container-high/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary-container via-primary-container to-primary" />
            
            <div className="flex items-center gap-3 mb-space-sm">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-bold uppercase tracking-wider">
                  Evidence Confirmed · Scientific Investigation
                </span>
              </div>
            </div>

            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight mb-space-sm">
              {result.title}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-4xl leading-relaxed mb-space-xl">
              {result.result}
            </p>

            {/* Scientific Explanation Box */}
            <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg border border-surface-container-high/60 mb-space-xl">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                Empirical Scientific Explanation
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {result.scientificExplanation}
              </p>
            </div>

            {/* Evidence Used in Discovery */}
            <div className="mb-space-xl">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm">
                Evidence Used in Discovery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                {result.evidenceUsed?.map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center gap-2.5"
                  >
                    <Workflow size={16} className="text-primary shrink-0" />
                    {item.findingId ? (
                      <Link
                        to={`/evidence/${item.findingId}`}
                        className="font-title-md text-body-sm font-semibold text-primary hover:underline"
                      >
                        Inspect Finding: {item.title} →
                      </Link>
                    ) : (
                      <span className="font-body-sm text-on-surface">{item.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Limitations & Takeaways */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-xl font-body-sm text-on-surface-variant">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">
                  Scientific Limitations
                </h3>
                <p className="leading-relaxed">
                  This simulated inquiry connects real observational telemetry and peer-reviewed studies. The original publication remains authoritative; review the source paper before drawing formal research conclusions.
                </p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <h3 className="font-title-md text-body-md font-bold text-on-surface mb-2">
                  Key Learning Takeaways
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  {result.learningPoints?.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-space-md border-t border-surface-container-high/60 flex flex-wrap items-center gap-space-md">
              <Link
                className="py-2.5 px-5 rounded-lg bg-surface-container-low text-primary font-label-md font-semibold hover:bg-surface-container transition-colors"
                to={`/research/${result.researchResource?._id}`}
              >
                Return to Original Research
              </Link>
              {quiz && (
                <a
                  href="#mystery-quiz"
                  className="py-2.5 px-5 rounded-lg bg-primary-container text-surface-container-lowest font-label-md font-semibold hover:bg-primary transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Continue to Quiz</span>
                  <ArrowRight size={15} />
                </a>
              )}
            </div>
          </article>

          {/* Optional Quiz Component */}
          {quiz && (
            <div id="mystery-quiz" className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
              <div className="flex items-center gap-2 mb-space-md">
                <ShieldCheck size={20} className="text-tertiary" />
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Contextual Scientific Quiz
                  </h3>
                  <p className="font-body-sm text-label-sm text-on-surface-variant">
                    Verify your understanding of the empirical evidence examined in this investigation.
                  </p>
                </div>
              </div>
              <QuizCard quiz={quiz} />
            </div>
          )}
        </section>
      </div>
    );
  }

  // 2. GUEST ACCESS GATE FOR INVESTIGATION (GAMEPLAY)
  if (mode === 'investigate' && !isAuthenticated) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mx-auto mb-3">
              <Lock size={22} />
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold block mb-1">
              MoES Scholar Registry · Investigation Session Required
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
              Investigate Polar Science Mysteries
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg leading-relaxed">
              Under MoES / NCPOR research protocols, playing interactive mystery games, recording deductive evidence answers, and acquiring SHA-256 tamper-evident credentials requires an accredited Scholar session.
            </p>

            <div className="flex flex-col gap-space-sm mb-space-lg">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:bg-surface-container-low text-on-surface font-title-md text-body-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs"
                onClick={async () => {
                  await loginDemoScholar();
                }}
              >
                <svg className="google-icon-sm shrink-0" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google OAuth to Play</span>
              </button>
              <Link
                className="py-2.5 px-4 rounded-lg bg-surface-container-low text-primary font-title-md text-body-sm font-semibold hover:bg-surface-container transition-colors"
                to={`/auth?redirect=/mystery/${id}/investigate`}
              >
                Sign In with Institutional Scholar ID
              </Link>
            </div>

            <div className="pt-space-md border-t border-surface-container-high/60 text-left text-label-sm text-outline">
              <strong className="text-on-surface block mb-0.5">Public Science Data Guarantee:</strong>
              All primary research publications, observational NetCDF-4 datasets, and evidence graphs remain 100% open and readable to the public without login.
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 3. INTRO MODE
  const { mystery } = payload;
  const clue = mystery?.clues?.[mystery?.progress?.currentClue || 0] || {};

  if (mode === 'intro') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
          <Link
            to="/learning"
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={16} /> Back to Learning Hub
          </Link>

          <article className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container-high/60 shadow-sm">
            <div className="flex items-center gap-2 mb-space-sm">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-label-sm text-label-sm font-bold uppercase tracking-wider border border-amber-200/50">
                Case Dossier · Optional Empirical Investigation
              </span>
            </div>

            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight mb-space-sm">
              {mystery.title}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-4xl leading-relaxed mb-space-lg">
              {mystery.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/60 mb-space-lg font-data-tabular text-body-sm">
              <div>
                <span className="text-outline text-label-sm block">Difficulty</span>
                <strong className="text-on-surface font-bold">{mystery.difficulty}</strong>
              </div>
              <div>
                <span className="text-outline text-label-sm block">Estimated Time</span>
                <strong className="text-on-surface font-bold">{mystery.estimatedTime}</strong>
              </div>
              <div>
                <span className="text-outline text-label-sm block">Linked Research</span>
                <strong className="text-primary font-bold truncate block">{mystery.researchResource?.title}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-md">
              {isAuthenticated ? (
                <Link
                  className="py-3 px-6 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-sm inline-flex items-center gap-2"
                  to={`/mystery/${id}/investigate`}
                >
                  <SearchCheck size={18} />
                  <span>Investigate Mystery</span>
                </Link>
              ) : (
                <Link
                  className="py-3 px-6 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-sm inline-flex items-center gap-2"
                  to={`/auth?redirect=/mystery/${id}/investigate`}
                >
                  <Lock size={18} />
                  <span>Sign In to Play Mystery</span>
                </Link>
              )}
              <Link
                className="py-3 px-5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors inline-flex items-center gap-2"
                to="/learning"
              >
                <Compass size={18} />
                <span>Continue Learning Track</span>
              </Link>
              <button
                className="py-3 px-4 rounded-lg bg-surface-container-lowest border border-surface-container-high text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors inline-flex items-center gap-2"
                type="button"
                onClick={toggleSave}
              >
                <Save size={16} />
                <span>{mystery.progress?.saved ? 'Saved' : 'Save for Later'}</span>
              </button>
            </div>
          </article>
        </section>
      </div>
    );
  }

  // 4. INVESTIGATE MODE (CLUES WORKSPACE)
  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-lg">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-data-tabular text-label-sm">
            <span className="text-primary font-bold uppercase tracking-wider">
              Clue {mystery.progress.currentClue + 1} of {mystery.clues.length}
            </span>
            <span className="text-outline">Track Ref: MYS-CDML-INVEST</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold">
            {mystery.title}
          </h1>
          <div className="w-full bg-surface-container-low rounded-full h-2.5 overflow-hidden border border-surface-container-high/60">
            <div
              className="bg-tertiary-container h-full rounded-full transition-all duration-500"
              style={{
                width: `${((mystery.progress.currentClue + 1) / mystery.clues.length) * 100}%`
              }}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
          {/* Left: Clue & Source Context */}
          <article className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold block mb-1">
                Active Evidence Clue
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm">
                {clue.title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                {clue.description}
              </p>

              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-start gap-3">
                <BookOpenText size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-title-md text-body-sm font-semibold text-on-surface block mb-0.5">
                    Authoritative Source Context
                  </strong>
                  <p className="font-body-sm text-label-sm text-on-surface-variant mb-2">
                    {mystery.researchResource?.title}
                  </p>
                  {clue.evidenceLink?.finding?._id && (
                    <Link
                      to={`/evidence/${clue.evidenceLink.finding._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-label-md text-label-sm text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect linked evidence record in new tab</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Right: Deduction Choices Panel */}
          <aside className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">
                What supports the clue?
              </h2>
              <p className="font-body-sm text-label-sm text-on-surface-variant mb-space-md">
                Select the deductive hypothesis confirmed by the field telemetry and ice-core evidence.
              </p>

              <div className="flex flex-col gap-space-xs mb-space-md">
                {clue.choices?.map((item) => (
                  <label
                    key={item}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      choice === item
                        ? 'bg-primary-container/10 border-primary-container text-on-surface shadow-2xs'
                        : 'bg-surface-container-low border-surface-container-high/60 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mystery-answer"
                      value={item}
                      checked={choice === item}
                      onChange={() => setChoice(item)}
                      className="mt-1 accent-primary-container"
                    />
                    <span className="font-body-sm text-body-sm font-medium leading-snug">{item}</span>
                  </label>
                ))}
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl font-body-sm text-label-md font-semibold mb-space-sm ${
                    feedback === 'Evidence Confirmed'
                      ? 'bg-tertiary-fixed/60 text-on-tertiary-fixed border border-tertiary/40'
                      : 'bg-error-container/40 text-error border border-error/20'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-space-xs pt-space-sm border-t border-surface-container-high/60">
              <button
                className="w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md font-semibold hover:bg-primary transition-all shadow-sm"
                type="button"
                onClick={submitAnswer}
              >
                Confirm with Evidence
              </button>
              <button
                className="w-full py-2 px-4 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-sm hover:bg-surface-container transition-colors"
                type="button"
                onClick={toggleSave}
              >
                Save &amp; Resume Later
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default MysteryPage;
