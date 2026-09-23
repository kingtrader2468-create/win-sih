import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpenText,
  Bot,
  ExternalLink,
  FileText,
  MessageSquare,
  Send,
  Sparkles,
  Workflow,
  Bookmark,
  Check,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  analyzeResearch,
  chatAboutResearch,
  getResearchResource,
  markResearchExplored,
  saveMystery
} from '../services/apiClient.js';
import './ResearchResourcePage.css';

function EvidenceClaim({ claim }) {
  if (!claim) return null;
  const findingId = claim.findingId || claim._id;
  return (
    <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/70 shadow-2xs flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-sm text-[11px] font-bold text-tertiary flex items-center gap-1">
          <ShieldCheck size={13} /> AI claim linked to source evidence
        </span>
        {claim.importance && (
          <span className="font-data-tabular text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant uppercase">
            {claim.importance}
          </span>
        )}
      </div>
      <h4 className="font-title-sm text-body-sm font-bold text-on-surface">{claim.title}</h4>
      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
        {claim.text || claim.description}
      </p>
      {findingId && (
        <div className="pt-1">
          <Link
            to={`/evidence/${findingId}`}
            className="inline-flex items-center gap-1.5 font-label-sm text-xs font-semibold text-primary hover:text-primary-container transition-colors"
          >
            <Workflow size={13} aria-hidden="true" /> View Evidence Graph &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

function ResearchResourcePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('idle');
  const [assistantLoadingAction, setAssistantLoadingAction] = useState(null);
  const [assistantStatus, setAssistantStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState('');
  const [mysterySaved, setMysterySaved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getResearchResource(id, controller.signal)
      .then((response) => {
        if (!ignore) {
          setData(response);
          setStatus('success');
          markResearchExplored(id);
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
  }, [id]);

  async function handleAIAction(actionType) {
    setAssistantLoadingAction(actionType);
    setAssistantStatus('loading');
    setError('');

    try {
      const result = await analyzeResearch(id);
      setAnalysis(result);
      setActiveTab(actionType === 'findings' ? 'findings' : actionType === 'simple' ? 'simple' : 'summary');
      setAssistantStatus('success');
    } catch (requestError) {
      setError(requestError.message);
      setAssistantStatus('error');
    } finally {
      setAssistantLoadingAction(null);
    }
  }

  async function submitQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;

    const userMessage = question.trim();
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', text: userMessage }]);
    setAssistantLoadingAction('chat');
    setAssistantStatus('loading');

    try {
      const response = await chatAboutResearch(id, userMessage);
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: response.answer, claim: response.claim, disclaimer: response.disclaimer }
      ]);
      setAssistantStatus('success');
    } catch (requestError) {
      setError(requestError.message);
      setAssistantStatus('error');
    } finally {
      setAssistantLoadingAction(null);
    }
  }

  async function handleSaveMystery() {
    try {
      const response = await saveMystery(id);
      setMysterySaved(response.saved);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (status === 'idle' && !data) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[400px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading original research resource…</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex flex-col items-start gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-error">
              <AlertCircle aria-hidden="true" size={24} />
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Research resource unavailable</h2>
            </div>
            <p className="font-body-md text-on-surface-variant">{error}</p>
            <Link className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md font-semibold hover:bg-surface-container transition-colors" to="/research">
              <ArrowLeft size={16} /> Back to Research Explorer
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { resource, findings = [], relatedResources = [] } = data;
  const verificationLabel = resource.verificationStatus || 'Prototype Demo Content';
  const isVerified = verificationLabel === 'Verified Source' || verificationLabel === 'Source-linked Resource';

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-lg flex flex-col gap-space-lg">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-2 font-label-md text-label-md font-medium text-on-surface-variant hover:text-primary transition-colors"
            to="/research"
          >
            <ArrowLeft aria-hidden="true" size={16} /> Back to Research Explorer
          </Link>
          <span className="font-data-tabular text-label-sm text-outline">
            RECORD ID: {id?.slice(-8).toUpperCase() || 'MOES-ARC'}
          </span>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          {/* LEFT COLUMN: RESEARCH RESOURCE DOCUMENT (Span 7 on lg, 8 on xl) */}
          <article className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
            {/* Header Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-bold ${
                    isVerified
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <ShieldCheck size={14} aria-hidden="true" /> {verificationLabel}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high/60 text-outline font-data-tabular text-label-sm font-semibold">
                  {resource.type}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high/60 text-outline font-data-tabular text-label-sm font-semibold">
                  {resource.region}
                </span>
                {resource.researchArea && (
                  <span className="px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high/60 text-outline font-data-tabular text-label-sm font-semibold">
                    {resource.researchArea}
                  </span>
                )}
              </div>

              <h1 className="font-headline-lg lg:font-display-sm text-headline-lg lg:text-display-sm font-extrabold text-on-surface tracking-tight leading-tight">
                {resource.title}
              </h1>

              <div className="flex items-center flex-wrap gap-2 font-data-tabular text-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">
                  {resource.authors?.length ? resource.authors.join(', ') : 'MoES / NCPOR Research Team'}
                </span>
                <span>·</span>
                <span>{resource.year || '2026'}</span>
                <span>·</span>
                <span className="text-primary font-medium">
                  {resource.source || 'Polar India Hub Institutional Archive'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-3 pt-2">
                {resource.fileUrl ? (
                  <a
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Open Original Source</span>
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-semibold border border-surface-container-high/60 opacity-80 cursor-not-allowed"
                    disabled
                    type="button"
                  >
                    Source Archive (Institutional Access)
                  </button>
                )}

                <button
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all border ${
                    isSaved
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/30'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-surface-container-high'
                  }`}
                  onClick={() => setIsSaved(!isSaved)}
                  type="button"
                >
                  {isSaved ? <Check size={16} className="text-tertiary" /> : <Bookmark size={16} />}
                  <span>{isSaved ? 'Saved to Journey' : 'Save Research'}</span>
                </button>
              </div>

              {/* OFFICIAL DOCUMENT RECORD PREVIEW */}
              <div className="mt-2 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-start gap-3">
                <FileText aria-hidden="true" size={24} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <strong className="font-title-sm text-body-sm font-bold text-on-surface">
                    Official Document Record
                  </strong>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    {resource.fileUrl
                      ? 'The verified scientific document is linked above from the institutional MoES / NCPOR repository.'
                      : 'Prototype Demo Content — Document metadata and structured findings represent this research record in the Polar India Hub archive.'}
                  </p>
                </div>
              </div>
            </div>

            {/* RESOURCE OVERVIEW */}
            <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-3">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Resource Overview
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {resource.description}
              </p>
            </section>

            {/* RESEARCH CONTENT / ABSTRACT */}
            {resource.contentText && (
              <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-3">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Research Content &amp; Findings Extract
                </h2>
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 font-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {resource.contentText}
                </div>
              </section>
            )}

            {/* METADATA & PROVENANCE */}
            <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Metadata &amp; Provenance
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Authors
                  </dt>
                  <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {resource.authors?.join(', ') || 'MoES / NCPOR Scientists'}
                  </dd>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Publication Year
                  </dt>
                  <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {resource.year || '2026'}
                  </dd>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Geographic Region
                  </dt>
                  <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {resource.region || 'Antarctica'}
                  </dd>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Research Area
                  </dt>
                  <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {resource.researchArea || 'Cryospheric Science'}
                  </dd>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Source Organization
                  </dt>
                  <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {resource.sourceOrganization || resource.source || 'NCPOR / MoES'}
                  </dd>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high/50 flex flex-col gap-1">
                  <dt className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                    Citation Record
                  </dt>
                  <dd className="font-body-sm text-xs font-medium text-on-surface-variant">
                    {resource.citation || `${resource.title}, ${resource.year || 2026}. Polar India Hub Archive.`}
                  </dd>
                </div>
              </dl>
            </section>

            {/* SOURCE-LINKED FINDINGS */}
            <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Source-Linked Findings
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Each claim below is extracted directly from the authoritative research source and mapped to field evidence.
                  </p>
                </div>
                <span className="font-data-tabular text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low border border-surface-container-high text-outline font-bold shrink-0">
                  {findings.length} findings
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {findings.length ? (
                  findings.map((finding) => (
                    <article
                      key={finding._id}
                      className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/40 transition-all flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-title-md text-body-md font-bold text-on-surface">
                          {finding.title}
                        </h3>
                        <span className="font-data-tabular text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface uppercase shrink-0">
                          {finding.importance || 'medium'}
                        </span>
                      </div>
                      <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60">
                        <span className="font-data-tabular text-xs text-outline font-semibold">
                          {(finding.evidenceLinks?.length || 0)} connected evidence links
                        </span>
                        <Link
                          to={`/evidence/${finding._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-surface-container-lowest font-label-sm text-xs font-semibold hover:bg-secondary/90 transition-all shadow-2xs"
                        >
                          <Workflow size={13} aria-hidden="true" /> View Evidence Graph
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="font-body-sm text-on-surface-variant text-center py-6">
                    No source-linked findings are currently recorded for this resource.
                  </p>
                )}
              </div>
            </section>

            {/* RELATED RESOURCES */}
            <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-lg lg:p-space-xl shadow-sm flex flex-col gap-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Related Resources in {resource.region}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedResources.length ? (
                  relatedResources.map((item) => (
                    <Link
                      key={item._id}
                      to={`/research/${item._id}`}
                      className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/40 hover:bg-surface-container transition-all flex flex-col gap-2 group"
                    >
                      <span className="font-data-tabular text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container-lowest text-outline w-fit">
                        {item.type}
                      </span>
                      <h4 className="font-title-sm text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 font-label-sm text-xs font-semibold text-primary mt-auto pt-1">
                        Read Resource <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="font-body-sm text-on-surface-variant text-center py-4 col-span-2">
                    No related resources found for this region.
                  </p>
                )}
              </div>
            </section>

            {/* OPTIONAL INVESTIGATION / MYSTERY UNLOCKED */}
            {analysis && (
              <section className="p-6 rounded-2xl bg-gradient-to-r from-primary-fixed/20 via-surface-container-low to-tertiary-fixed/20 border border-primary/20 flex flex-col gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-surface-container-lowest flex items-center justify-center shrink-0">
                    <Sparkles size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold">
                      Mystery Unlocked · Guided Inquiry
                    </span>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Optional Evidence Investigation
                    </h2>
                    <p className="font-body-sm text-on-surface-variant mt-1 leading-relaxed">
                      Turn the evidence behind this study into an interactive investigation. Explore clues, inspect field data, and confirm discoveries.
                    </p>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 pt-2">
                  <Link
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary/90 transition-all shadow-2xs"
                    to={`/mystery/${id}`}
                  >
                    <Compass size={16} /> Investigate Mystery
                  </Link>
                  <Link
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-low border border-surface-container-high transition-colors"
                    to="/learning"
                  >
                    Continue Learning Track
                  </Link>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium transition-colors"
                    onClick={handleSaveMystery}
                    type="button"
                  >
                    {mysterySaved ? 'Saved for Later' : 'Save for Later'}
                  </button>
                </div>
                <small className="font-body-sm text-[11px] text-outline">
                  * Mysteries are optional and will never block your normal learning journey or quiz progress.
                </small>
              </section>
            )}
          </article>

          {/* RIGHT COLUMN: DOCKED CONTEXTUAL AI RESEARCH ASSISTANT (Span 5 on lg, 4 on xl) */}
          <aside className="lg:col-span-5 xl:col-span-4 sticky top-28 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-md lg:p-space-lg shadow-sm flex flex-col gap-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-surface-container-lowest flex items-center justify-center">
                  <Bot size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-label-lg text-label-lg font-bold text-on-surface tracking-tight leading-tight">
                    AI RESEARCH ASSISTANT
                  </h2>
                  <span className="font-body-sm text-[11px] text-outline">
                    Assisting with this study
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 font-label-sm text-[11px] font-bold text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full">
                <ShieldCheck size={12} /> Grounded
              </span>
            </div>

            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50">
              Original research remains authoritative. AI assists with plain-language explanations, evidence tracing, and contextual Q&amp;A.
            </p>

            {/* AI ACTION BUTTONS */}
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="AI Research Actions">
              <button
                className={`py-2 px-2 text-center rounded-lg font-label-sm text-xs font-semibold transition-all ${
                  activeTab === 'summary' && analysis
                    ? 'bg-primary-container text-surface-container-lowest shadow-2xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => handleAIAction('summarize')}
                disabled={assistantStatus === 'loading'}
                type="button"
              >
                {assistantLoadingAction === 'summarize' ? 'Analyzing…' : 'Summarize'}
              </button>

              <button
                className={`py-2 px-2 text-center rounded-lg font-label-sm text-xs font-semibold transition-all ${
                  activeTab === 'findings' && analysis
                    ? 'bg-primary-container text-surface-container-lowest shadow-2xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => handleAIAction('findings')}
                disabled={assistantStatus === 'loading'}
                type="button"
              >
                {assistantLoadingAction === 'findings' ? 'Tracing…' : 'Key Findings'}
              </button>

              <button
                className={`py-2 px-2 text-center rounded-lg font-label-sm text-xs font-semibold transition-all ${
                  activeTab === 'simple' && analysis
                    ? 'bg-primary-container text-surface-container-lowest shadow-2xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => handleAIAction('simple')}
                disabled={assistantStatus === 'loading'}
                type="button"
              >
                {assistantLoadingAction === 'simple' ? 'Explaining…' : 'Explain Simply'}
              </button>
            </div>

            {/* LOADING STATE */}
            {assistantStatus === 'loading' && assistantLoadingAction !== 'chat' && (
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center gap-3">
                <span className="loading-mark" aria-hidden="true" />
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {assistantLoadingAction === 'summarize' && 'Analyzing research document and building evidence context…'}
                  {assistantLoadingAction === 'findings' && 'Tracing key findings to linked observation datasets…'}
                  {assistantLoadingAction === 'simple' && 'Preparing educational plain-language explanation…'}
                </p>
              </div>
            )}

            {/* ERROR DISPLAY */}
            {assistantStatus === 'error' && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2 text-error text-xs">
                <AlertCircle size={15} />
                <span>{error || 'Unable to complete AI analysis.'}</span>
              </div>
            )}

            {/* STRUCTURED AI OUTPUT */}
            {analysis && (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {/* Mode disclaimer */}
                <div className="font-body-sm text-[11px] text-outline italic">
                  {analysis.disclaimer}
                </div>

                {/* Tab: Summary */}
                {activeTab === 'summary' && (
                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/60 flex flex-col gap-1.5">
                    <h3 className="font-title-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                      AI Summary
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {/* Tab: Key Findings */}
                {activeTab === 'findings' && (
                  <div className="flex flex-col gap-2">
                    <h3 className="font-title-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                      Key Findings Linked to Evidence
                    </h3>
                    {analysis.keyFindings?.length ? (
                      analysis.keyFindings.map((claim, index) => (
                        <EvidenceClaim key={claim.findingId || index} claim={claim} />
                      ))
                    ) : (
                      <p className="font-body-sm text-xs text-on-surface-variant">No findings mapped.</p>
                    )}
                  </div>
                )}

                {/* Tab: Simplified Explanation */}
                {activeTab === 'simple' && (
                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/60 flex flex-col gap-1.5">
                    <h3 className="font-title-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                      Simplified Explanation
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                      {analysis.simpleExplanation}
                    </p>
                  </div>
                )}

                {/* Important Terms */}
                {analysis.importantTerms?.length > 0 && (
                  <div className="pt-2 border-t border-surface-container-high/60 flex flex-col gap-1.5">
                    <h3 className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline">
                      Important Terms
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.importantTerms.map((term) => (
                        <span
                          key={term}
                          className="px-2 py-0.5 rounded-full bg-surface-container-low border border-surface-container-high/60 font-body-sm text-[11px] text-on-surface font-medium"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTEXTUAL CHAT THREAD */}
            <div className="pt-3 border-t border-surface-container-high/60 flex flex-col gap-3">
              <h3 className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1.5">
                <MessageSquare size={14} aria-hidden="true" className="text-primary" />
                Ask About This Resource
              </h3>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {messages.length === 0 && (
                  <p className="font-body-sm text-xs text-outline text-center py-2">
                    Ask any question about this study or its linked datasets.
                  </p>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-surface-container-lowest ml-4 self-end'
                        : 'bg-surface-container-low text-on-surface border border-surface-container-high/60 mr-2 self-start'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.claim && <EvidenceClaim claim={msg.claim} />}
                    {msg.disclaimer && (
                      <small className="block mt-1 text-[10px] opacity-75 italic">{msg.disclaimer}</small>
                    )}
                  </div>
                ))}

                {assistantLoadingAction === 'chat' && (
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface-variant flex items-center gap-2 self-start">
                    <span className="loading-mark" aria-hidden="true" />
                    <span>Analyzing research context…</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form className="flex items-center gap-2" onSubmit={submitQuestion}>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about this study or evidence…"
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  aria-label="Ask a contextual question"
                />
                <button
                  className="p-2 rounded-lg bg-primary text-surface-container-lowest hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={assistantStatus === 'loading' || !question.trim()}
                  type="submit"
                  aria-label="Send question"
                >
                  <Send size={14} />
                </button>
              </form>

              <p className="font-body-sm text-[11px] text-outline flex items-center gap-1">
                <BookOpenText size={12} className="shrink-0" />
                <span>AI answers only use this selected study and verified evidence.</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default ResearchResourcePage;
