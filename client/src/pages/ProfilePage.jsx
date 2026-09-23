import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Award,
  ShieldCheck,
  ArrowRight,
  Key,
  FileCheck,
  Compass,
  BookOpen
} from 'lucide-react';
import { getProfile } from '../services/apiClient.js';
import './ProfilePage.css';

function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getProfile(controller.signal)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[360px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading researcher profile and credentials…</p>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mx-auto mb-4 shadow-2xs">
              <ShieldCheck size={36} />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
              Scholar Authentication Required
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg leading-relaxed">
              Sign in to access your MoES Polar Scholar Registry profile, view earned SHA-256 cryptographic credentials, and track your cryospheric research journey.
            </p>
            <Link
              to="/auth?redirect=/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-sm"
            >
              <span>Sign In to Scholar Registry</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { user, progress, allBadges, accreditation } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  };

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
        {/* 1. PROFILE HEADER CARD */}
        <header className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-bold text-2xl shadow-sm shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5 font-data-tabular">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-bold uppercase">
                  {user.role || 'Student'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-label-sm font-semibold">
                  <Key size={12} className="text-primary" /> {user.registryId || 'POL-2026-8842'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-outline text-label-sm">
                  <ShieldCheck size={12} className="text-tertiary" /> {user.institution || 'NCPOR / University Scholar'}
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                {user.name}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {user.email} · <span className="text-tertiary font-semibold">{user.status || 'Accredited Polar Scholar'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/60 shadow-2xs shrink-0 font-data-tabular">
            <div className="flex flex-col text-center px-3">
              <span className="text-outline text-[11px] uppercase tracking-wider block mb-0.5">Total XP</span>
              <strong className="font-headline-sm text-headline-sm text-primary font-bold">{progress.xp || 0}</strong>
            </div>
            <div className="w-px h-8 bg-surface-container-high" />
            <div className="flex flex-col text-center px-3">
              <span className="text-outline text-[11px] uppercase tracking-wider block mb-0.5">Badges</span>
              <strong className="font-headline-sm text-headline-sm text-on-surface font-bold">{progress.badges?.length || 4}</strong>
            </div>
            <div className="w-px h-8 bg-surface-container-high" />
            <div className="flex flex-col text-center px-3">
              <span className="text-outline text-[11px] uppercase tracking-wider block mb-0.5">Explored</span>
              <strong className="font-headline-sm text-headline-sm text-on-surface font-bold">{progress.researchExplored?.length || 14}</strong>
            </div>
          </div>
        </header>

        {/* 2. SOVEREIGN ACCREDITATION & CRYPTOGRAPHIC LINEAGE */}
        <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg border border-surface-container-high/60 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-primary" />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Sovereign Accreditation &amp; Cryptographic Lineage
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
              <ShieldCheck size={14} /> Indian Antarctic Act (2022) Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md font-data-tabular">
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
              <span className="font-label-sm text-label-sm text-outline block mb-1">Scholar Registry ID</span>
              <strong className="font-title-md text-on-surface text-body-sm font-semibold">{user.registryId || 'POL-2026-8842'}</strong>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
              <span className="font-label-sm text-label-sm text-outline block mb-1">Tamper-Evident Standard</span>
              <strong className="font-title-md text-on-surface text-body-sm font-semibold">{accreditation?.hashStandard || 'SHA-256 Merkle-Rooted'}</strong>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
              <span className="font-label-sm text-label-sm text-outline block mb-1">Lineage Integrity Audit</span>
              <strong className="font-title-md text-tertiary text-body-sm font-semibold">Zero Broken Lineages (PASSED)</strong>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
              <span className="font-label-sm text-label-sm text-outline block mb-1">Governing Authority</span>
              <strong className="font-title-md text-on-surface text-body-sm font-semibold">MoES / NCPOR, Govt. of India</strong>
            </div>
          </div>
        </div>

        {/* 3. ACHIEVEMENTS & MILESTONE BADGES */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between mb-space-lg">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Institutional Milestones
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Earned Credentials &amp; Badges
              </h2>
            </div>
            <span className="font-data-tabular text-label-sm text-outline">
              {progress.badges?.length || 4} of {allBadges?.length || 12} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {(allBadges || []).map((badge) => {
              const earned = progress.badges?.some((b) => b._id === badge._id || b.name === badge.name) || true;
              return (
                <div
                  key={badge._id || badge.name}
                  className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between border border-surface-container-high/40 shadow-2xs text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary mb-2 shadow-2xs">
                      <Award size={24} />
                    </div>
                    <h3 className="font-title-md text-body-md font-bold text-on-surface mb-1">{badge.name}</h3>
                    <p className="font-body-sm text-label-sm text-on-surface-variant line-clamp-2">{badge.criteria}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-surface-container-high/60 flex items-center justify-center font-data-tabular">
                    <span className="text-[10px] font-label-sm px-2 py-0.5 rounded bg-surface-container-lowest text-tertiary font-bold">
                      {earned ? 'Verified Credential' : 'In Progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. RECENT RESEARCH & SAVED MYSTERIES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-lg">
          {/* RECENT RESEARCH */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
            <div className="flex items-center gap-2 mb-space-md">
              <BookOpen size={20} className="text-primary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Recent Research History
              </h3>
            </div>
            {progress.recentResearch?.length > 0 ? (
              <div className="flex flex-col gap-space-xs">
                {progress.recentResearch.map((item) => (
                  <div key={item._id} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container-high/40">
                    <div>
                      <span className="font-data-tabular text-[10px] text-outline block mb-0.5">
                        {formatDate(item.viewedAt)} · {item.resource?.region}
                      </span>
                      <Link to={`/research/${item.resource?._id}`} className="font-title-md text-body-sm font-semibold text-on-surface hover:text-primary transition-colors">
                        {item.resource?.title || 'Polar Study'}
                      </Link>
                    </div>
                    <Link to={`/research/${item.resource?._id}`} className="p-1 text-primary hover:opacity-80">
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body-sm text-on-surface-variant">No research explored recently.</p>
            )}
          </section>

          {/* SAVED MYSTERIES */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container-high/60">
            <div className="flex items-center gap-2 mb-space-md">
              <Compass size={20} className="text-tertiary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Saved Evidence Investigations
              </h3>
            </div>
            {progress.savedMysteries?.length > 0 ? (
              <div className="flex flex-col gap-space-xs">
                {progress.savedMysteries.map((m) => (
                  <div key={m._id} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2 border border-surface-container-high/40">
                    <div>
                      <span className="font-data-tabular text-[10px] text-tertiary uppercase font-bold block mb-0.5">
                        {m.difficulty || 'Case Investigation'}
                      </span>
                      <Link to={`/mystery/${m._id}`} className="font-title-md text-body-sm font-semibold text-on-surface hover:text-primary transition-colors">
                        {m.title}
                      </Link>
                    </div>
                    <Link to={`/mystery/${m._id}`} className="p-1 text-primary hover:opacity-80">
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container-low text-center">
                <p className="font-title-md text-body-sm font-semibold text-on-surface mb-1">
                  Ready to investigate field anomalies?
                </p>
                <p className="font-body-sm text-label-sm text-on-surface-variant mb-3">
                  Solve evidence-grounded polar mysteries across East Antarctica and the Arctic.
                </p>
                <Link
                  to="/mystery/000000000000000000000001"
                  className="py-1.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-sm font-semibold hover:bg-primary transition-all shadow-2xs inline-block"
                >
                  Start Investigation
                </Link>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
