const filterFields = [
  ['region', 'Region', 'regions'],
  ['station', 'Station', 'stations'],
  ['type', 'Resource type', 'types'],
  ['researchArea', 'Research area', 'researchAreas'],
  ['year', 'Year', 'years']
];

function FilterBar({ filters, options, onChange, onClear }) {
  return <div className="filter-bar"><div className="filter-bar__controls">{filterFields.map(([name, label, optionName]) => <label key={name} className="filter-control"><span>{label}</span><select value={filters[name]} onChange={(event) => onChange(name, event.target.value)}><option value="">All {label.toLowerCase()}s</option>{(options[optionName] || []).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}<label className="filter-control"><span>Sort</span><select value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label></div><button className="button button--ghost" onClick={onClear} type="button">Clear filters</button></div>;
}

export default FilterBar;
