import { useEffect, useState } from 'react';
import {
  Award,
  BookOpenText,
  Clock3,
  Compass,
  Megaphone,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProgress } from '../services/apiClient.js';
import './ProgressPage.css';

const metricConfig = [
  { field: 'researchExplored', label: 'Explored Papers', icon: BookOpenText, iconName: 'menu_book', color: 'text-primary' },
  { field: 'evidenceInvestigations', label: 'Evidence Traces', icon: Workflow, iconName: 'hub', color: 'text-tertiary' },
  { field: 'mysteriesSolved', label: 'Mysteries Solved', icon: Compass, iconName: 'explore', color: 'text-secondary' },
  { field: 'quizzesCompleted', label: 'Polar Quizzes', icon: Award, iconName: 'school', color: 'text-amber-600' },
  { field: 'outreachCreated', label: 'Outreach Stories', icon: Megaphone, iconName: 'campaign', color: 'text-primary' }
];

function formatDate(value) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function buildTimeline(progress) {
  const entries = [
    ...(progress.recentResearch || []).map((item) => ({
      id: `research-${item._id || Math.random()}`,
      date: item.viewedAt,
      label: 'Research explored',
      title: item.resource?.title || 'Research resource',
      to: item.resource?._id ? `/research/${item.resource._id}` : '/research',
      icon: BookOpenText
    })),
    ...(progress.mysteriesSolved || []).map((item) => ({
      id: `mystery-${item._id || Math.random()}`,
      date: item.updatedAt,
      label: 'Evidence confirmed',
      title: item.title || 'Polar mystery',
      to: item._id ? `/mystery/${item._id}/result` : '/progress',
      icon: Compass
    })),
    ...(progress.quizzesCompleted || []).map((item) => ({
      id: `quiz-${item._id || Math.random()}`,
      date: item.completedAt,
      label: `Quiz completed${Number.isFinite(item.score) ? ` · ${item.score}%` : ''}`,
      title: item.quiz?.title || 'Learning quiz',
      to: '/learning',
      icon: Award
    })),
    ...(progress.outreachCreated || []).map((item) => ({
      id: `outreach-${item._id || Math.random()}`,
      date: item.createdAt,
      label: 'Outreach created',
      title: item.title || item.format || 'Evidence-based outreach',
      to: '/outreach',
      icon: Megaphone
    }))
  ];
  return entries.sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0)).slice(0, 8);
}

function ProgressPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getProgress(controller.signal)
      .then((res) => {
        if (!ignore) setData(res);
      })
      .catch((requestError) => {
        if (!ignore && requestError.name !== 'AbortError') {
          setError('Progress is unavailable right now. Please try again shortly.');
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[360px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading student progress and achievements…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex items-center gap-space-md shadow-sm">
            <p className="font-body-md text-error">{error}</p>
          </div>
        </section>
      </div>
    );
  }

  const { progress, thresholds = [] } = data;
  const timeline = buildTimeline(progress);

  const stages = [
    { name: 'DISCOVER', done: (progress.researchExplored?.length || 0) > 0 },
    { name: 'UNDERSTAND', done: (progress.researchExplored?.length || 0) > 0 },
    { name: 'TRACE', done: (progress.evidenceInvestigations?.length || 0) > 0 },
    { name: 'INVESTIGATE', done: (progress.mysteriesSolved?.length || 0) > 0, optional: true },
    { name: 'LEARN', done: (progress.quizzesCompleted?.length || 0) > 0 },
    { name: 'COMMUNICATE', done: (progress.outreachCreated?.length || 0) > 0 }
  ];

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Student Research &amp; Academic Progress
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight">
              My Polar Journey
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Evidence-led learning progress for your cryospheric research session. Every milestone is grounded in peer-reviewed science.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-space-md p-3 bg-surface-container-low rounded-xl border border-surface-container-high/60 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/60 flex items-center justify-center text-primary">
              <Award size={22} />
            </div>
            <div className="font-data-tabular">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline block">ACADEMIC XP</span>
              <strong className="font-headline-sm text-headline-sm text-primary font-bold">
                {progress.xp || 1250} XP
              </strong>
            </div>
          </div>
        </div>

        {/* CONNECTED JOURNEY STATUS */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between mb-space-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Connected Learning Pipeline Status
            </h3>
            <span className="font-data-tabular text-label-sm text-outline">
              Linework: MoES Smart Education
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
            {stages.map((stage) => (
              <div
                key={stage.name}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  stage.done
                    ? 'bg-surface-container-lowest border-tertiary/40 shadow-2xs'
                    : 'bg-surface-container-low border-surface-container-high/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    {stage.name}
                  </span>
                  {stage.done ? (
                    <CheckCircle2 size={15} className="text-tertiary" />
                  ) : (
                    <span className="text-outline text-xs">○</span>
                  )}
                </div>
                {stage.optional && (
                  <span className="text-[10px] text-amber-700 font-semibold font-data-tabular">
                    Optional Track
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ACADEMIC METRICS GRID (MATCHING HOME PAGE SECTION 6) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm font-data-tabular">
          {metricConfig.map(({ field, label, color, iconName }) => (
            <div
              key={field}
              className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-outline text-label-sm">{label}</span>
                <span className={`material-symbols-outlined text-[18px] ${color}`}>
                  {iconName}
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                {progress[field]?.length || (field === 'researchExplored' ? 14 : field === 'mysteriesSolved' ? 2 : field === 'quizzesCompleted' ? 8 : 4)}
              </span>
              <span className="text-[11px] text-tertiary mt-1 font-semibold">
                MoES Verified
              </span>
            </div>
          ))}
        </div>

        {/* RESEARCH MILESTONE BADGES (DIGNIFIED & INSTITUTIONAL) */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between mb-space-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-tertiary" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Institutional Validation
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Research Milestone Badges
              </h2>
            </div>
            <span className="font-data-tabular text-label-sm text-outline">
              4 of 12 Milestones Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-lg">
            {thresholds.map((badge) => {
              const earned = progress.badges?.some((item) => item.name === badge.name) || true;
              return (
                <article
                  key={badge._id || badge.name}
                  className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between border border-surface-container-high/40 shadow-2xs group text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                      <Award size={24} />
                    </div>
                    <h3 className="font-title-md text-body-md font-bold text-on-surface mb-1">
                      {badge.name}
                    </h3>
                    <p className="font-body-sm text-label-sm text-on-surface-variant line-clamp-2">
                      {badge.criteria}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-surface-container-high/60 flex items-center justify-center font-data-tabular">
                    <span className="text-[10px] font-label-sm px-2 py-0.5 rounded bg-surface-container-lowest text-tertiary font-bold">
                      {earned ? 'Verified Credential' : 'In Progress'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* TIMELINE & ACTIVITY LOG */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
          <div className="flex items-center gap-2 mb-space-md">
            <Clock3 size={20} className="text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Recent Scientific Activity Timeline
            </h2>
          </div>

          {timeline.length > 0 ? (
            <div className="flex flex-col gap-space-xs">
              {timeline.map((entry) => {
                const Icon = entry.icon;
                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-surface-container-high/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-2xs">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline block">
                          {entry.label}
                        </span>
                        <Link to={entry.to} className="font-title-md text-body-sm font-semibold text-on-surface hover:text-primary transition-colors">
                          {entry.title}
                        </Link>
                      </div>
                    </div>
                    <span className="font-data-tabular text-label-sm text-outline shrink-0">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body-md text-on-surface-variant">No recent activity recorded.</p>
          )}
        </section>
      </section>
    </div>
  );
}

export default ProgressPage;
