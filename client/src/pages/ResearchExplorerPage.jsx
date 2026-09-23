import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';
import FilterBar from '../components/FilterBar.jsx';
import ResearchCard from '../components/ResearchCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { getResearch } from '../services/apiClient.js';
import './ResearchExplorerPage.css';

const initialFilters = {
  search: '',
  region: '',
  type: '',
  researchArea: '',
  year: '',
  sort: 'newest',
  page: 1,
  limit: 6
};

function ResearchExplorerPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState({
    items: [],
    pagination: { page: 1, total: 0, totalPages: 1 },
    filters: {}
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const query = useMemo(() => filters, [filters]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getResearch(query, controller.signal)
      .then((data) => {
        if (!ignore) {
          setResult(data);
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
  }, [query]);

  function updateFilter(name, value) {
    setStatus('loading');
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  function clearFilters() {
    setStatus('loading');
    setFilters(initialFilters);
  }

  function goToPage(page) {
    setStatus('loading');
    setFilters((current) => ({ ...current, page }));
  }

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
        {/* Page Heading & Eyebrow */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Scientific Repository Explorer
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface font-extrabold tracking-tight">
              Research Explorer
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Browse source-linked papers, field telemetry reports, and observational monographs across India’s polar campaigns.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-primary font-data-tabular text-label-sm font-semibold border border-surface-container-high/60">
              {status === 'success' ? `${result.pagination.total} authoritative records` : 'Loading records…'}
            </span>
          </div>
        </div>

        {/* Filter Controls Box */}
        <div className="bg-surface-container-low rounded-2xl p-space-md lg:p-space-lg mb-space-xl border border-surface-container-high/60 shadow-2xs">
          <div className="flex flex-col gap-space-md">
            <SearchBar
              value={filters.search}
              onChange={(value) => updateFilter('search', value)}
            />
            <FilterBar
              filters={filters}
              options={result.filters}
              onChange={updateFilter}
              onClear={clearFilters}
            />
          </div>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 flex flex-col items-center justify-center min-h-[280px] shadow-sm">
            <span className="loading-mark" aria-hidden="true" />
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              Loading authoritative research resources…
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex flex-col md:flex-row items-center gap-space-md shadow-sm">
            <AlertCircle aria-hidden="true" size={28} className="text-error shrink-0" />
            <div className="flex-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Research resources are unavailable
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
            </div>
            <button
              className="px-5 py-2 rounded-lg bg-primary-container text-surface-container-lowest font-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
              type="button"
              onClick={() => {
                setStatus('loading');
                setFilters((current) => ({ ...current }));
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === 'success' && result.items.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-outline mb-3">
              <FileSearch aria-hidden="true" size={24} />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              No matching research records found
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1 mb-space-md">
              Adjust your search keywords or clear applied filters to discover the available cryospheric studies.
            </p>
            <button
              className="px-5 py-2.5 rounded-lg bg-secondary text-surface-container-lowest font-label-md font-semibold hover:bg-secondary/90 transition-all shadow-2xs"
              type="button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Success Grid */}
        {status === 'success' && result.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-lg">
              {result.items.map((resource) => (
                <ResearchCard key={resource._id} resource={resource} />
              ))}
            </div>

            {/* Pagination Controls */}
            {result.pagination.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-space-md mt-space-2xl font-data-tabular" aria-label="Research pages">
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md disabled:opacity-40 disabled:cursor-not-allowed border border-surface-container-high/60"
                  disabled={result.pagination.page === 1}
                  onClick={() => goToPage(result.pagination.page - 1)}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={16} /> Previous
                </button>
                <span className="font-data-tabular text-body-sm text-outline px-2">
                  Page <strong className="text-on-surface">{result.pagination.page}</strong> of{' '}
                  <strong className="text-on-surface">{result.pagination.totalPages}</strong>
                </span>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md disabled:opacity-40 disabled:cursor-not-allowed border border-surface-container-high/60"
                  disabled={result.pagination.page === result.pagination.totalPages}
                  onClick={() => goToPage(result.pagination.page + 1)}
                  type="button"
                >
                  Next <ChevronRight aria-hidden="true" size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default ResearchExplorerPage;
