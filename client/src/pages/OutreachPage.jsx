import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Copy,
  FileText,
  Megaphone,
  ShieldCheck,
  Workflow,
  Share2,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { getResearch, generateOutreach } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import './OutreachPage.css';

const formats = [
  'Instagram Post',
  '60-sec Video Script',
  'School Presentation',
  'Infographic',
  'Quiz'
];

function OutreachPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);

  const [resourceId, setResourceId] = useState('');
  const [format, setFormat] = useState(formats[0]);
  const [generated, setGenerated] = useState(null);
  const [stage, setStage] = useState('select');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedNotice, setSharedNotice] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getResearch({ limit: 24 }, controller.signal)
      .then((data) => {
        if (!ignore) {
          setResources(data.items);
          if (data.items[0]) setResourceId(data.items[0]._id);
          setStatus('ready');
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
  }, []);

  const resource = resources.find((item) => item._id === resourceId);

  async function generate() {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/outreach');
      return;
    }
    if (!resourceId) return;
    setStage('generate');
    setError('');
    setSharedNotice(false);

    try {
      const result = await generateOutreach({ researchResource: resourceId, format });
      setGenerated(result);
      setStage('review');
    } catch (requestError) {
      setError(requestError.message);
      setStage('select');
    }
  }

  function copyContent() {
    if (!generated?.content?.content) return;
    navigator.clipboard?.writeText(generated.content.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleReadyToShare() {
    setSharedNotice(true);
    setStage('share');
  }

  if (status === 'loading') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[360px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading research context and outreach studio…</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
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

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Science Communication · NCPOR Dissemination Studio
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight">
              Turn Science Into a Story
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Create compelling, source-attributed communication drafts. Every story retains its linked research and verified evidence trail.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
              <ShieldCheck size={14} /> Source-Grounding Active
            </span>
          </div>
        </div>

        {/* STEP TRACKER */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 font-data-tabular text-label-sm">
          {[
            { num: '01', name: 'SELECT RESEARCH' },
            { num: '02', name: 'SELECT FORMAT' },
            { num: '03', name: 'AI GENERATION' },
            { num: '04', name: 'PEER REVIEW' },
            { num: '05', name: 'DISSEMINATION' }
          ].map((s, i, arr) => (
            <div key={s.num} className="flex items-center gap-2 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-label-sm font-bold ${
                  (stage === 'select' && i <= 1) || (stage === 'generate' && i === 2) || (stage === 'review' && i <= 3) || (stage === 'share' && i <= 4)
                    ? 'bg-secondary text-surface-container-lowest'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {s.num} {s.name}
              </span>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-outline-variant" />}
            </div>
          ))}
        </div>

        {/* WORKSPACE DUAL-COLUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          {/* LEFT: Context & Configuration */}
          <aside className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm flex flex-col gap-space-lg">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Source Context &amp; Format
              </h2>
            </div>

            {/* Select Resource */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="outreach-resource" className="font-label-md text-label-md text-on-surface font-semibold">
                Select Authoritative Research Paper
              </label>
              <select
                id="outreach-resource"
                value={resourceId}
                onChange={(event) => {
                  setResourceId(event.target.value);
                  setGenerated(null);
                  setStage('select');
                  setSharedNotice(false);
                }}
                className="w-full px-3 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                {resources.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title} ({item.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Context Card Preview */}
            {resource && (
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-data-tabular text-[11px] font-bold w-fit">
                  {resource.type}
                </span>
                <h3 className="font-title-md text-body-md font-bold text-on-surface">
                  {resource.title}
                </h3>
                <p className="font-body-sm text-label-sm text-on-surface-variant line-clamp-3">
                  {resource.description}
                </p>
                <div className="pt-2 border-t border-surface-container-high/70 flex items-center gap-1 text-[11px] text-tertiary font-semibold">
                  <Workflow size={13} />
                  <span>Evidence trail linked to station telemetry</span>
                </div>
              </div>
            )}

            {/* Select Format */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="outreach-format" className="font-label-md text-label-md text-on-surface font-semibold">
                Outreach Format
              </label>
              <select
                id="outreach-format"
                value={format}
                onChange={(event) => {
                  setFormat(event.target.value);
                  if (generated) setStage('select');
                }}
                className="w-full px-3 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                {formats.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate CTA Button */}
            {isAuthenticated ? (
              <button
                className="w-full py-3 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={!resourceId || stage === 'generate'}
                onClick={generate}
                type="button"
              >
                {stage === 'generate' ? (
                  <>
                    <span className="loading-mark" aria-hidden="true" />
                    <span>Generating Story with AI…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Evidence Story</span>
                  </>
                )}
              </button>
            ) : (
              <button
                className="w-full py-3 px-4 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2 border border-surface-container-high/60"
                onClick={() => navigate('/auth?redirect=/outreach')}
                type="button"
              >
                <Lock size={16} />
                <span>Sign In to Generate Outreach</span>
              </button>
            )}
          </aside>

          {/* RIGHT: Generated Output Workspace */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container-high/60 shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-xs pb-space-sm border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-tertiary" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Generated Dissemination Draft
                </h3>
              </div>
              <span className="font-data-tabular text-label-sm text-outline uppercase font-semibold">
                Format: {format}
              </span>
            </div>

            {/* Content Display */}
            {generated?.content?.content ? (
              <div className="flex flex-col gap-space-md">
                <div className="p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/60 font-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                  {generated.content.content}
                </div>

                {/* Evidence Attribution Guarantee */}
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/60 flex items-center justify-between gap-2 text-label-sm text-outline font-data-tabular">
                  <span>Grounding: <strong>100% Peer-Attributed</strong></span>
                  <span className="text-tertiary font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> NCPOR Citation Included
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                  <button
                    type="button"
                    onClick={copyContent}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors"
                  >
                    {copied ? <Check size={16} className="text-tertiary" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReadyToShare}
                    className="inline-flex items-center gap-1.5 py-2 px-5 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
                  >
                    <Share2 size={16} />
                    <span>Ready to Disseminate</span>
                  </button>
                </div>

                {sharedNotice && (
                  <div className="p-3 rounded-lg bg-tertiary-fixed/40 border border-tertiary/20 text-on-tertiary-fixed font-body-sm text-body-sm flex items-center gap-2">
                    <Check size={16} className="text-tertiary" />
                    <span>Story marked ready for public education channels and classroom presentation.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-space-2xl text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-outline mb-3">
                  <Sparkles size={22} className="text-primary" />
                </div>
                <h4 className="font-title-md text-body-lg font-bold text-on-surface mb-1">
                  Draft Preview Workspace
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  Select a research publication and target outreach format on the left, then generate an evidence-verified draft.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default OutreachPage;
