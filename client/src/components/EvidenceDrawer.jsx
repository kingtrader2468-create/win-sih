import { ExternalLink, FileText, X, Workflow, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function EvidenceDrawer({ node, onClose }) {
  if (!node) {
    return (
      <aside className="p-space-lg flex flex-col items-center justify-center text-center h-full min-h-[300px] text-outline">
        <Workflow size={36} className="text-surface-container-high mb-2" />
        <p className="font-title-sm text-body-sm font-bold text-on-surface">No Evidence Node Selected</p>
        <p className="font-body-sm text-xs text-on-surface-variant mt-1">
          Click any node in the graph to inspect its scientific provenance and telemetry source.
        </p>
      </aside>
    );
  }

  return (
    <aside className="p-space-md lg:p-space-lg flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-outline flex items-center gap-1">
            <ShieldCheck size={13} className="text-tertiary" /> Evidence Node Inspector
          </span>
          <h2 className="font-title-lg text-body-lg font-bold text-on-surface leading-snug">
            {node.title}
          </h2>
        </div>
        <button
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors shrink-0"
          type="button"
          onClick={onClose}
          aria-label="Close evidence drawer"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      {/* Metadata Metrics */}
      <dl className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50 flex flex-col">
          <dt className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-outline">Type</dt>
          <dd className="font-body-sm text-xs font-bold text-primary truncate mt-0.5">{node.type}</dd>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50 flex flex-col">
          <dt className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-outline">Source</dt>
          <dd className="font-body-sm text-xs font-semibold text-on-surface truncate mt-0.5">{node.source || 'NCPOR'}</dd>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50 flex flex-col">
          <dt className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-outline">Year</dt>
          <dd className="font-body-sm text-xs font-semibold text-on-surface mt-0.5">{node.year || '2026'}</dd>
        </div>
      </dl>

      {/* Description */}
      <section className="flex flex-col gap-1.5">
        <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
          Description &amp; Observation Context
        </h3>
        <p className="font-body-sm text-xs leading-relaxed text-on-surface-variant p-3 rounded-xl bg-surface-container-low border border-surface-container-high/50">
          {node.description || 'Verified observation data collected by scientific instrumentation during expedition field operations.'}
        </p>
      </section>

      {/* Related Research */}
      <section className="flex flex-col gap-1.5">
        <h3 className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
          Related Research Resource
        </h3>
        {node.relatedResearch ? (
          <Link
            to={`/research/${node.relatedResearch}`}
            className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/50 text-xs font-semibold text-primary transition-all flex items-center justify-between"
          >
            <span>Open Related Study</span>
            <ExternalLink size={13} />
          </Link>
        ) : (
          <p className="font-body-sm text-xs text-outline italic">No related research resource is directly linked.</p>
        )}
      </section>

      {/* Action CTA */}
      <div className="mt-auto pt-3 border-t border-surface-container-high/60">
        {node.sourceUrl ? (
          <a
            className="w-full py-2.5 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-xs font-semibold hover:bg-primary transition-all shadow-2xs flex items-center justify-center gap-2"
            href={node.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            <FileText aria-hidden="true" size={14} />
            <span>Open Source Record</span>
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        ) : (
          <button
            className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-xs font-semibold border border-surface-container-high/60 flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
            disabled
            type="button"
          >
            <FileText aria-hidden="true" size={14} />
            <span>Archived Record (Institutional Access)</span>
          </button>
        )}
      </div>
    </aside>
  );
}

export default EvidenceDrawer;
