import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  Award,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { getDashboard, getResearch } from '../services/apiClient.js';
import './LearningHubPage.css';

const journeyMilestones = [
  { id: 'discover', name: 'DISCOVER', label: 'Explore original polar studies', state: 'done' },
  { id: 'understand', name: 'UNDERSTAND', label: 'Contextual AI summarization', state: 'done' },
  { id: 'trace', name: 'TRACE', label: 'Inspect evidence provenance graph', state: 'done' },
  { id: 'investigate', name: 'INVESTIGATE', label: 'Optional scientific mystery', state: 'optional' },
  { id: 'learn', name: 'LEARN', label: 'Complete research-linked quiz', state: 'done' },
  { id: 'communicate', name: 'COMMUNICATE', label: 'Draft source-grounded outreach', state: 'in-progress' }
];

function LearningHubPage() {
  const [dashboard, setDashboard] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getDashboard(controller.signal),
      getResearch({ limit: 4 }, controller.signal)
    ])
      .then(([dashData, researchData]) => {
        setDashboard(dashData);
        setRecommended(researchData.items || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Unable to load Learning Hub records.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const progress = dashboard?.userProgress;
  const recentResource = progress?.recentResearch?.[0]?.resource || recommended[0];
  const savedMysteries = progress?.savedMysteries || [];

  if (loading) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[360px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading your Polar Learning Hub…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex items-center gap-space-md shadow-sm">
            <AlertCircle size={28} className="text-error shrink-0" />
            <div>
              <h2 className="font-headline-sm text-on-surface font-bold">Learning Hub Unavailable</h2>
              <p className="font-body-sm text-on-surface-variant mt-1">{error}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
        {/* 1. HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-tertiary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Smart Education · NCPOR Cryospheric Education
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight">
              Learning Hub
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Continue your sovereign polar science journey. Discover empirical studies, reconstruct ice-core proxies, and test evidence understanding.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-space-md p-3 bg-surface-container-low rounded-xl border border-surface-container-high/60 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/60 flex items-center justify-center text-primary">
              <Award size={22} aria-hidden="true" />
            </div>
            <div className="font-data-tabular">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline block">ACADEMIC MERIT</span>
              <strong className="font-headline-sm text-headline-sm text-primary font-bold">
                {progress?.xp || 1250} XP
              </strong>
            </div>
          </div>
        </header>

        {/* 2. JOURNEY PIPELINE BAR */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm" aria-label="Learning journey progression">
          {journeyMilestones.map((m, index) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                m.state === 'done'
                  ? 'bg-surface-container-lowest border-tertiary/30 shadow-2xs'
                  : m.state === 'optional'
                  ? 'bg-surface-container-lowest border-amber-300/40 shadow-2xs'
                  : 'bg-surface-container-low border-surface-container-high/60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-data-tabular text-[11px] font-bold text-outline">0{index + 1}</span>
                <span className="font-label-sm text-[10px] font-bold tracking-wider text-on-surface uppercase">
                  {m.name}
                </span>
                {m.state === 'done' && <CheckCircle2 size={14} className="text-tertiary" />}
                {m.state === 'optional' && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 text-[9px] font-semibold">
                    Opt
                  </span>
                )}
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant leading-tight">{m.label}</span>
            </div>
          ))}
        </div>

        {/* 3. CONTINUE LEARNING SPOTLIGHT */}
        {recentResource && (
          <article className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary-container via-primary-container to-primary" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
                    ACTIVE LEARNING TRACK
                  </span>
                  <span className="font-data-tabular text-label-sm text-outline">
                    {recentResource.region}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">
                  {recentResource.title}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed mb-space-md">
                  {recentResource.description || 'Pick up where you left off with this authoritative cryospheric study.'}
                </p>
                <div className="flex flex-wrap items-center gap-space-xs font-data-tabular text-label-sm">
                  <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface">
                    {recentResource.type}
                  </span>
                  <span className="text-outline">Source: {recentResource.source || 'NCPOR'}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-space-md">
                <Link
                  to={`/research/${recentResource._id}`}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md font-semibold hover:bg-tertiary/90 transition-all shadow-sm"
                >
                  <span>Resume Research &amp; AI</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* 4. MAIN TWO-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
          {/* LEFT COLUMN: Quizzes & Recommended Studies */}
          <div className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* RESEARCH-LINKED QUIZZES */}
            <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-2">
                  <HelpCircle size={20} className="text-primary" />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Research-Linked Quizzes
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary font-data-tabular text-label-sm font-semibold">
                  Grounded in original sources
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg leading-relaxed">
                Test your understanding of methodology, observational datasets, and findings directly extracted from peer-reviewed studies.
              </p>

              <div className="flex flex-col gap-space-sm">
                {recommended.slice(0, 3).map((res) => (
                  <div
                    key={res._id}
                    className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-surface-container-high/40"
                  >
                    <div>
                      <span className="font-data-tabular text-[10px] text-outline uppercase block mb-1">
                        {res.region || 'Polar Region'}
                      </span>
                      <h3 className="font-title-md text-body-md font-bold text-on-surface mb-1">
                        Quiz: {res.title}
                      </h3>
                      <p className="font-body-sm text-label-sm text-on-surface-variant">
                        5 multiple-choice questions on measurement techniques and empirical evidence.
                      </p>
                    </div>
                    <Link
                      to={`/research/${res._id}`}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-surface-container-lowest font-label-md text-label-md font-semibold transition-colors shadow-2xs shrink-0"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* RECOMMENDED RESEARCH FOR STUDY */}
            <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-secondary" />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Recommended Studies for Students
                  </h2>
                </div>
                <Link to="/research" className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>View all</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {recommended.map((res) => (
                  <article key={res._id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between border border-surface-container-high/40">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 font-data-tabular text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-semibold">
                          {res.type}
                        </span>
                        <span className="text-outline">{res.region}</span>
                      </div>
                      <h4 className="font-title-md text-body-md font-bold text-on-surface mb-1 line-clamp-2">
                        <Link to={`/research/${res._id}`} className="hover:text-primary transition-colors">
                          {res.title}
                        </Link>
                      </h4>
                      <p className="font-body-sm text-label-sm text-on-surface-variant line-clamp-2 mb-3">
                        {res.description || 'Polar cryosphere investigation.'}
                      </p>
                    </div>
                    <Link
                      to={`/research/${res._id}`}
                      className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Read &amp; Trace Evidence</span>
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Saved Mysteries, Badges & Quick Stats */}
          <aside className="lg:col-span-4 flex flex-col gap-space-xl">
            {/* OPTIONAL POLAR MYSTERIES */}
            <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-2">
                  <Compass size={20} className="text-primary" />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Polar Mysteries
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-label-sm text-[11px] font-semibold">
                  Inquiry-Led
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md leading-relaxed">
                Empirical puzzles identified by field expeditions requiring multi-sensor evidence tracing.
              </p>

              {savedMysteries.length > 0 ? (
                <div className="flex flex-col gap-space-sm">
                  {savedMysteries.map((m) => (
                    <div
                      key={m._id}
                      className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-data-tabular text-[10px] text-tertiary font-bold uppercase block">
                          {m.difficulty || 'Case Dossier'}
                        </span>
                        <h4 className="font-title-md text-body-sm font-bold text-on-surface">{m.title}</h4>
                      </div>
                      <Link
                        to={`/mystery/${m._id}`}
                        className="py-1.5 px-3 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-sm font-semibold hover:bg-primary transition-all shadow-2xs"
                      >
                        Resume
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-container-low text-center flex flex-col items-center">
                  <p className="font-title-md text-body-sm font-semibold text-on-surface mb-1">
                    Larsemann Hills Temperature Anomaly
                  </p>
                  <p className="font-body-sm text-label-sm text-on-surface-variant mb-3">
                    East Antarctic coastal warming puzzle ready for student investigation.
                  </p>
                  <Link
                    to="/mystery/000000000000000000000001"
                    className="py-2 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
                  >
                    Investigate Mystery
                  </Link>
                </div>
              )}
            </section>

            {/* RESEARCH BADGE RECOGNITION */}
            <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Credentials
                </span>
                <span className="font-data-tabular text-label-sm text-outline">4 Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-space-xs font-data-tabular">
                <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
                  <span className="material-symbols-outlined text-primary text-[22px] block mb-1">explore</span>
                  <strong className="text-[11px] block leading-tight text-on-surface">Field Scout</strong>
                  <span className="text-[9px] text-tertiary">Verified</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
                  <span className="material-symbols-outlined text-tertiary text-[22px] block mb-1">layers</span>
                  <strong className="text-[11px] block leading-tight text-on-surface">Data Analyst</strong>
                  <span className="text-[9px] text-tertiary">Verified</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high/60 text-center">
                <Link to="/progress" className="font-label-md text-label-sm text-primary font-semibold hover:underline">
                  View Full Academic Profile &amp; Badges →
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default LearningHubPage;
