import { Search, RotateCcw } from 'lucide-react';

function CatalogFilters({ filters, options, onChange, onClear }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-space-md lg:p-space-lg mb-space-xl border border-surface-container-high/60 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm items-center">
        {/* Search input with icon */}
        <div className="lg:col-span-2 relative flex items-center">
          <Search size={16} className="absolute left-3 text-outline pointer-events-none" />
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search records, titles, authors, keywords..."
            type="search"
            className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        {options.years?.length > 0 && (
          <div>
            <select value={filters.year} onChange={(event) => onChange('year', event.target.value)} className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container">
              <option value="">All Years</option>
              {options.years.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        )}

        {options.journals?.length > 0 && (
          <div>
            <select value={filters.journal} onChange={(event) => onChange('journal', event.target.value)} className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container">
              <option value="">All Journals</option>
              {options.journals.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        )}

        {options.sources?.length > 0 && (
          <div>
            <select value={filters.source} onChange={(event) => onChange('source', event.target.value)} className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container">
              <option value="">All Sources</option>
              {options.sources.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        )}

        {/* Region Filter */}
        <div>
          <select
            value={filters.region}
            onChange={(event) => onChange('region', event.target.value)}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            <option value="">All Polar Regions</option>
            {(options.regions || []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Station Filter */}
        {options.stations?.length > 0 && (
          <div>
            <select
              value={filters.station}
              onChange={(event) => onChange('station', event.target.value)}
              className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">All Stations / Regional Studies</option>
              {options.stations.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        )}

        {/* Type Filter */}
        {options.types?.length > 0 ? (
          <div>
            <select
              value={filters.type}
              onChange={(event) => onChange('type', event.target.value)}
              className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">All Record Types</option>
              {options.types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <select
              value={filters.status}
              onChange={(event) => onChange('status', event.target.value)}
              className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">All Statuses</option>
              {(options.statuses || []).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters Button */}
        <div>
          <button
            className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5"
            type="button"
            onClick={onClear}
          >
            <RotateCcw size={14} className="text-outline" />
            <span>Clear filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CatalogFilters;
