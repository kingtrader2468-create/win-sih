import { Search } from 'lucide-react';

function SearchBar({ value, onChange }) {
  return <label className="search-bar"><Search aria-hidden="true" size={18} /><span className="sr-only">Search research resources</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search research papers, reports, authors, or topics" type="search" /></label>;
}

export default SearchBar;
