import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="w-full bg-surface-container-lowest min-h-[calc(100vh-280px)] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-xl w-full bg-surface-container-lowest rounded-2xl p-space-2xl border border-surface-container-high/60 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mx-auto mb-4 shadow-2xs">
          <Compass size={36} />
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-low text-primary font-data-tabular text-label-sm font-bold uppercase tracking-wider mb-2">
          Error 404 · Uncharted Coordinate
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mb-2">
          Polar Record Not Found
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-xl leading-relaxed">
          The requested cryospheric page, expedition record, or telemetry endpoint does not exist or has been relocated within the NCPOR sovereign registry.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-space-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Explore</span>
          </Link>
          <Link
            to="/research"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
          >
            <span>Browse Research</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
