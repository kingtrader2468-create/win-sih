import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Link2,
  Database,
  Compass,
  FileCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CatalogCard from '../components/CatalogCard.jsx';
import CatalogFilters from '../components/CatalogFilters.jsx';
import { getCatalog, getCatalogItem } from '../services/apiClient.js';
import './CatalogPages.css';

const labels = {
  expeditions: ['Field Operations & Polar Missions', 'Indian Polar Expeditions', 'Explore connected scientific expeditions across Antarctica, the Arctic, and the Himalayas.'],
  datasets: ['Observational Datasets & Telemetry', 'Polar Datasets Databank', 'Discover open NetCDF-4 observational datasets, ice-core proxies, and marine sensor array telemetry.'],
  publications: ['Peer-Reviewed Science & Monographs', 'Scientific Publications', 'Access peer-reviewed monographs, journal papers, and research findings governed by NCPOR and MoES.'],
  media: ['Scientific Outreach & Field Dissemination', 'Field Media & Outreach', 'High-resolution imagery, field briefings, audio recordings, and classroom education assets.'],
  stations: ['Permanent Research Bases', 'Tri-Polar Stations & Observatories', 'Live station telemetry, geographical coordinates, and facilities across Antarctica, Arctic, and Himalayas.']
};

export function CatalogListPage({ collection }) {
  const [data, setData] = useState({ items: [], filters: {} });
  const [filters, setFilters] = useState({ search: '', region: '', type: '', status: '' });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getCatalog(collection, filters, controller.signal)
      .then((value) => {
        if (!ignore) {
          setData(value);
          setStatus('success');
        }
      })
      .catch((error) => {
        if (!ignore && error.name !== 'AbortError') {
          setStatus('error');
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [collection, filters]);

  const update = (name, value) => {
    setStatus('loading');
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clear = () => {
    setStatus('loading');
    setFilters({ search: '', region: '', type: '', status: '' });
  };

  const info = labels[collection] || ['Repository Catalog', 'Explorer', 'Explore verified scientific records.'];

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                {info[0]}
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight">
              {info[1]}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              {info[2]}
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-primary font-data-tabular text-label-sm font-semibold border border-surface-container-high/60">
              {status === 'success' ? `${data.items.length} records available` : 'Loading records…'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <CatalogFilters
          filters={filters}
          options={data.filters}
          onChange={update}
          onClear={clear}
        />

        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 flex flex-col items-center justify-center min-h-[280px] shadow-sm">
            <span className="loading-mark" aria-hidden="true" />
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              Loading authoritative {collection} records…
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex flex-col md:flex-row items-center gap-space-md shadow-sm">
            <AlertCircle size={28} className="text-error shrink-0" />
            <div className="flex-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Records are temporarily unavailable
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Unable to retrieve repository records. Please verify your connection or try again.
              </p>
            </div>
            <button
              className="px-5 py-2 rounded-lg bg-primary-container text-surface-container-lowest font-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
              type="button"
              onClick={() => {
                setStatus('loading');
                setFilters((current) => ({ ...current }));
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === 'success' && !data.items.length && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              No matching records found
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1 mb-space-md">
              Try adjusting your search criteria or resetting filters to view all entries.
            </p>
            <button
              className="px-5 py-2.5 rounded-lg bg-secondary text-surface-container-lowest font-label-md font-semibold hover:bg-secondary/90 transition-all shadow-2xs"
              type="button"
              onClick={clear}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Grid */}
        {status === 'success' && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-lg">
            {data.items.map((item) => (
              <CatalogCard collection={collection} item={item} key={item._id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function CatalogDetailPage({ collection }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getCatalogItem(collection, id, controller.signal)
      .then((res) => {
        if (!ignore) setData(res);
      })
      .catch((requestError) => {
        if (!ignore && requestError.name !== 'AbortError') {
          setError(requestError.message);
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [collection, id]);

  const collectionLabel = labels[collection] || ['Record', 'Details', 'Details are available in this record.'];

  if (error) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex items-center gap-space-md shadow-sm">
            <AlertCircle size={28} className="text-error shrink-0" />
            <div>
              <h2 className="font-headline-sm text-on-surface font-bold">Record Unavailable</h2>
              <p className="font-body-sm text-on-surface-variant mt-1">{error}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[320px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading record details…</p>
        </section>
      </div>
    );
  }

  const item = data.item;

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        {/* Back Link */}
        <Link
          to={`/${collection}`}
          className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary font-semibold hover:underline mb-space-lg"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to {collectionLabel[1]}</span>
        </Link>

        {/* Main Detail Card */}
        <article className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container-high/60 shadow-sm flex flex-col gap-space-xl">
          {/* Eyebrow & Compliance Row */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                {collectionLabel[0]}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                <ShieldCheck size={14} /> MoES Charter Compliant
              </span>
            </div>

            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight mb-space-sm leading-tight">
              {item.title || item.name}
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-4xl leading-relaxed">
              {item.description || item.abstract || 'Details are available in this record.'}
            </p>
          </div>

          {/* DATASET SCIENTIFIC SPECIFICATIONS */}
          {collection === 'datasets' && (
            <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg border border-surface-container-high/60">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2 mb-space-md">
                <Database size={20} className="text-primary" />
                <span>Scientific Data Standards &amp; Telemetry</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-md">
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Format &amp; Conventions</span>
                  <strong className="font-title-md text-on-surface font-semibold text-body-sm">
                    {item.dataFormat || 'NetCDF-4 (.nc)'} · {item.cfConvention || 'CF-1.8'}
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Spatial Projection</span>
                  <strong className="font-title-md text-on-surface font-semibold text-body-sm">
                    {item.spatialProjection || 'WGS 84 / Polar Stereographic'}
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Calibration Standard</span>
                  <strong className="font-title-md text-on-surface font-semibold text-body-sm">
                    {item.calibrationStandard || 'TEOS-10 Pressure Calibrated'}
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Ingestion &amp; Feeds</span>
                  <strong className="font-title-md text-on-surface font-semibold text-body-sm">
                    DataCite REST · OAI-PMH
                  </strong>
                </div>
              </div>

              {item.doi && (
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60 flex flex-wrap items-center justify-between gap-space-sm font-data-tabular text-body-sm">
                  <span>Permanent DOI Identifier: <strong className="text-primary">{item.doi}</strong></span>
                  <span className="inline-flex items-center gap-1 text-tertiary font-semibold text-label-sm">
                    <FileCheck size={14} /> Crossref Resolved
                  </span>
                </div>
              )}

              {item.variables?.length > 0 && (
                <div className="mt-space-md pt-space-sm border-t border-surface-container-high/70">
                  <span className="font-label-sm text-label-sm text-outline block mb-2">
                    Observed Variables (CF Standard):
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-data-tabular">
                    {item.variables.map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-label-sm border border-surface-container-high/60 font-mono">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATION TELEMETRY SPECIFICATIONS */}
          {collection === 'stations' && (
            <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg border border-surface-container-high/60">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2 mb-space-md">
                <Compass size={20} className="text-primary" />
                <span>Polar Triad Telemetry &amp; Coordinates</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md font-data-tabular">
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Geographic Coordinates</span>
                  <strong className="text-on-surface text-body-sm font-semibold">
                    {item.coordinates
                      ? `${item.coordinates.latitude > 0 ? `${item.coordinates.latitude}°N` : `${Math.abs(item.coordinates.latitude)}°S`}, ${item.coordinates.longitude > 0 ? `${item.coordinates.longitude}°E` : `${Math.abs(item.coordinates.longitude)}°W`}`
                      : 'Polar Station'}
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Operational Status</span>
                  <strong className="text-tertiary text-body-sm font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> Active Telemetry Uplink
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Governing Authority</span>
                  <strong className="text-on-surface text-body-sm font-semibold">
                    MoES / NCPOR Sovereign Base
                  </strong>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/60">
                  <span className="font-label-sm text-label-sm text-outline block mb-1">Treaty Compliance</span>
                  <strong className="text-on-surface text-body-sm font-semibold">
                    Indian Antarctic Act (2022)
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Meta Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/60 font-data-tabular">
            {['region', 'status', 'year', 'code', 'license', 'journal']
              .filter((field) => item[field])
              .map((field) => (
                <div key={field} className="flex flex-col">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline">
                    {field}
                  </span>
                  <span className="font-title-md text-body-sm font-semibold text-on-surface capitalize truncate">
                    {item[field]}
                  </span>
                </div>
              ))}
          </div>

          {/* Empirical Provenance Relationships */}
          <div className="pt-space-md border-t border-surface-container-high/60">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2 mb-2">
              <Link2 size={18} className="text-primary" />
              <span>Empirical Provenance Network</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              {collection === 'expeditions'
                ? 'Expedition → Sensor Moorings → NetCDF-4 Datasets → Publications → Outreach'
                : collection === 'datasets'
                ? 'Dataset (CF-1.8) → In-Situ Observations → Research Finding → Evidence DAG'
                : collection === 'publications'
                ? 'Publication (DOI) → Research Findings → Evidence Provenance'
                : collection === 'stations'
                ? 'Station Telemetry → Expeditions → Primary CTD Observations'
                : 'Media Asset → Expedition → Research Context'}
            </p>

            {data.relatedResources?.length > 0 && (
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Connected Research Resources:
                </span>
                <div className="flex flex-wrap gap-space-xs">
                  {data.relatedResources.map((resource) => (
                    <Link
                      key={resource._id}
                      to={`/research/${resource._id}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-title-md text-body-sm font-semibold transition-colors border border-surface-container-high/60 shadow-2xs"
                    >
                      <span>{resource.title}</span>
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
