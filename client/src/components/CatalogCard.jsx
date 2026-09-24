import { ArrowRight, CalendarDays, MapPin, Database, Cpu, Compass, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function CatalogCard({ item, collection }) {
  const label = collection === 'media'
    ? item.type
    : collection === 'stations'
      ? 'Station'
      : collection === 'publications'
        ? 'Scholarly record'
        : collection.slice(0, -1);

  const getBadgeClass = () => {
    switch (collection) {
      case 'expeditions':
        return 'bg-amber-50 text-amber-900 border border-amber-200/50';
      case 'datasets':
        return 'bg-primary-container/20 text-primary border border-primary-container/30';
      case 'publications':
        return 'bg-primary-fixed text-on-primary-fixed-variant';
      case 'stations':
        return 'bg-tertiary-fixed text-on-tertiary-fixed';
      default:
        return 'bg-secondary-container text-on-secondary-container';
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-surface-container-high/60">
      {collection === 'media' && item.thumbnailUrl && (
        <a href={item.sourceUrl || item.url} target="_blank" rel="noreferrer" className="mb-space-md block overflow-hidden rounded-xl bg-surface-container-low aspect-[16/9]">
          <img
            src={item.thumbnailUrl}
            alt={item.title || 'NASA polar media'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </a>
      )}
      <div>
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold tracking-wide uppercase ${getBadgeClass()}`}>
            {label}
          </span>
          {item.region && (
            <span className="font-data-tabular text-label-sm text-outline flex items-center gap-1">
              <MapPin size={13} className="text-outline-variant" />
              {item.region}
            </span>
          )}
          {item.category?.station && (
            <span className="font-data-tabular text-label-sm text-outline">
              {item.category.station}
            </span>
          )}
          {item.code && (
            <span className="font-data-tabular text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface">
              {item.code}
            </span>
          )}
          {collection === 'publications' && item.source && (
            <span className="font-data-tabular text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface">
              Source: {item.source}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors leading-snug mb-space-xs">
          {collection === 'media' && !item._id && item.sourceUrl ? (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
              {item.title || item.name}
            </a>
          ) : (
            <Link to={`/${collection}/${item._id}`} className="hover:underline">
              {item.title || item.name}
            </Link>
          )}
        </h2>

        {/* Description / Abstract */}
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-space-md">
          {item.description || item.abstract || 'Sovereign cryospheric science and polar observational record.'}
        </p>

        {/* Standards & Technical Badges */}
        {collection === 'datasets' && (
          <div className="flex flex-wrap items-center gap-space-xs mb-space-md font-data-tabular text-label-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface">
              <Database size={12} className="text-primary" /> {item.dataFormat || 'NetCDF-4 (.nc)'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface">
              <FileCheck size={12} className="text-tertiary" /> {item.cfConvention || 'CF-1.8'}
            </span>
            {item.calibrationStandard && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-outline truncate max-w-[140px]">
                <Cpu size={12} /> {item.calibrationStandard}
              </span>
            )}
          </div>
        )}

        {collection === 'stations' && item.coordinates && (
          <div className="flex flex-wrap items-center gap-space-xs mb-space-md font-data-tabular text-label-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low text-on-surface">
              <Compass size={12} className="text-primary" />
              {item.coordinates.latitude > 0 ? `${item.coordinates.latitude}°N` : `${Math.abs(item.coordinates.latitude)}°S`},{' '}
              {item.coordinates.longitude > 0 ? `${item.coordinates.longitude}°E` : `${Math.abs(item.coordinates.longitude)}°W`}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> Telemetry Online
            </span>
          </div>
        )}
      </div>

      {/* Footer Row */}
      <div className="pt-space-md border-t border-surface-container-high/60 flex items-center justify-between gap-space-sm font-data-tabular text-label-sm">
        <div className="flex items-center gap-2 text-outline">
          {item.year && (
            <span className="flex items-center gap-1">
              <CalendarDays size={13} />
              {item.year}
            </span>
          )}
          {item.doi && (
            <span className="truncate max-w-[120px] bg-surface-container-low px-1.5 py-0.5 rounded text-[11px]">
              {item.doi}
            </span>
          )}
        </div>
        <Link
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-primary hover:text-surface-container-lowest transition-colors shadow-2xs"
          to={`/${collection}/${item._id}`}
        >
          <span>Open record</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default CatalogCard;
