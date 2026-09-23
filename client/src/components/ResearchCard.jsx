import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function ResearchCard({ resource }) {
  const isVerified = resource.verificationStatus === 'Verified Source' || resource.verificationStatus === 'Source-linked Resource';

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-surface-container-high/60">
      <div>
        {/* Top Badges & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold tracking-wide uppercase">
            {resource.type || 'Research Paper'}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold">
              <ShieldCheck size={11} aria-hidden="true" />
              Verified
            </span>
          )}
          <span className="font-data-tabular text-label-sm text-outline">
            {resource.year || '2024'}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors leading-snug mb-space-xs">
          <Link to={`/research/${resource._id}`} className="hover:underline">
            {resource.title}
          </Link>
        </h2>

        {/* Authors & Research Area */}
        <p className="font-label-md text-label-md text-secondary font-medium mb-space-sm">
          {resource.researchArea || 'Cryospheric Science'} · {resource.region || 'Polar Region'}
        </p>

        {/* Description */}
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-space-md">
          {resource.description}
        </p>

        {/* Evidence Indicators Pill Group */}
        <div className="flex flex-wrap items-center gap-space-xs mb-space-lg font-data-tabular text-label-sm">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-primary">database</span>
            {resource.datasetsCount || 'Linked Data'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-tertiary">hub</span>
            Evidence Graph
          </span>
          {resource.source && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-outline truncate max-w-[150px]">
              {resource.source}
            </span>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-space-md border-t border-surface-container-high/60 flex items-center justify-between gap-space-sm">
        <Link
          to={`/research/${resource._id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-surface-container-lowest transition-colors shadow-2xs"
        >
          <span>View Research &amp; Evidence</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default ResearchCard;
