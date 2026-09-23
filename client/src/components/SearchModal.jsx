import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  FileText,
  Database,
  ShipWheel,
  BookOpen,
  Radio,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { globalSearch } from '../services/apiClient.js';
import './SearchModal.css';

const exampleQueries = [
  'Antarctica research',
  'Ice observations',
  'Polar expedition',
  'Cryosphere',
  'Sea ice'
];

const typeIcons = {
  Research: FileText,
  Dataset: Database,
  Expedition: ShipWheel,
  Publication: BookOpen,
  Media: Radio
};

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setStatus('idle');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let ignore = false;
    const controller = new AbortController();

    const timer = setTimeout(() => {
      globalSearch(trimmed, controller.signal)
        .then((data) => {
          if (!ignore) {
            setResults(data.results || []);
            setStatus('success');
          }
        })
        .catch((err) => {
          if (!ignore && err.name !== 'AbortError') {
            setStatus('error');
          }
        });
    }, 200);

    return () => {
      ignore = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setStatus('idle');
    } else {
      setStatus('loading');
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    setStatus('loading');
  };

  if (!isOpen) return null;

  const handleSelect = (url) => {
    handleClose();
    navigate(url);
  };

  return (
    <div className="search-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Global polar search">
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal__header">
          <Search size={20} className="search-modal__icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search polar research, datasets, expeditions, publications..."
            className="search-modal__input"
            aria-label="Search query"
          />
          {query && (
            <button
              type="button"
              className="search-modal__clear"
              onClick={() => {
                setQuery('');
                setResults([]);
                setStatus('idle');
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            className="search-modal__close-btn"
            onClick={handleClose}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        <div className="search-modal__examples">
          <span className="search-modal__examples-label">
            <Sparkles size={13} aria-hidden="true" /> Examples:
          </span>
          {exampleQueries.map((item) => (
            <button
              key={item}
              type="button"
              className="search-chip"
              onClick={() => handleExampleClick(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="search-modal__body">
          {status === 'loading' && (
            <div className="search-state search-state--loading">
              <span className="loading-mark" aria-hidden="true" />
              <p>Searching polar records across repository...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="search-state search-state--error">
              <p>Unable to perform search right now. Please try again.</p>
            </div>
          )}

          {status === 'success' && results.length === 0 && (
            <div className="search-state search-state--empty">
              <p>No results found for “{query}”.</p>
              <small>Try terms like “Antarctica”, “Sea ice”, “ Bharati”, or “Cryosphere”.</small>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results-list">
              <div className="search-results-count">
                Found {results.length} connected record{results.length > 1 ? 's' : ''}
              </div>
              {results.map((item) => {
                const IconComponent = typeIcons[item.type] || FileText;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(item.url)}
                  >
                    <div className="search-result-item__icon-wrap">
                      <IconComponent size={18} aria-hidden="true" />
                    </div>
                    <div className="search-result-item__content">
                      <div className="search-result-item__top">
                        <span className={`search-badge search-badge--${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                        {item.region && (
                          <span className="search-result-item__meta">{item.region}</span>
                        )}
                        {item.year && (
                          <span className="search-result-item__meta">
                            <Clock size={12} /> {item.year}
                          </span>
                        )}
                      </div>
                      <h4 className="search-result-item__title">{item.title}</h4>
                      {item.description && (
                        <p className="search-result-item__desc">
                          {item.description.slice(0, 110)}...
                        </p>
                      )}
                    </div>
                    <ArrowRight size={16} className="search-result-item__arrow" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}

          {status === 'idle' && (
            <div className="search-state search-state--idle">
              <p>Type to search across research papers, observational datasets, expeditions, publications, and field media.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
