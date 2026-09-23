import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity,
  BookOpenText,
  Database,
  FileText,
  FlaskConical,
  GitBranch,
  Megaphone,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Radio,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { getAdminDashboard, getAdminRecords, updateAdminRecordStatus } from '../services/apiClient.js';
import './AdminPage.css';

const sections = [
  { to: '/admin', label: 'Overview', icon: Activity },
  { to: '/admin/telemetry', label: 'Telemetry & QA/QC', icon: Radio },
  { to: '/admin/resources', label: 'Resources', icon: BookOpenText },
  { to: '/admin/expeditions', label: 'Expeditions', icon: Route },
  { to: '/admin/datasets', label: 'Datasets', icon: Database },
  { to: '/admin/publications', label: 'Publications', icon: FileText },
  { to: '/admin/mysteries', label: 'Mysteries', icon: Sparkles },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity }
];

const labels = {
  resources: 'Research resources',
  expeditions: 'Expeditions',
  datasets: 'Datasets',
  publications: 'Publications',
  mysteries: 'Mysteries'
};
const statusOptions = ['draft', 'published', 'archived', 'active', 'completed'];

function Metric({ icon: Icon, label, value, to }) {
  const content = (
    <div className="flex items-center gap-3.5 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm hover:border-primary/40 transition-all flex-1">
      <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 border border-surface-container-high/60">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-label-sm text-xs font-semibold text-on-surface-variant truncate">{label}</span>
        <strong className="font-data-tabular text-xl font-bold text-on-surface leading-tight mt-0.5">{value ?? 0}</strong>
      </div>
    </div>
  );
  return to ? <Link to={to} className="flex flex-1">{content}</Link> : content;
}

function formatRecordMeta(record) {
  return [record.type, record.region, record.researchArea, record.year, record.journal, record.format].filter(Boolean).join(' · ') || 'Prototype Demo Content';
}

function AdminSidebar() {
  return (
    <aside className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-space-md lg:p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-high/60">
        <div className="w-8 h-8 rounded-lg bg-primary text-surface-container-lowest flex items-center justify-center">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong className="block font-title-sm text-xs font-bold text-on-surface uppercase tracking-wider">
            Institutional Workspace
          </strong>
          <span className="font-body-sm text-[11px] text-outline">MoES / NCPOR Directorate</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Administration navigation">
        {sections.map(({ to, label, icon: Icon }) => (
          <NavLink
            end={to === '/admin'}
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl font-label-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary-container text-surface-container-lowest shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-surface-container-high/60 flex items-start gap-2 text-outline">
        <GitBranch size={15} className="text-tertiary shrink-0 mt-0.5" />
        <p className="font-body-sm text-[11px] leading-tight">
          Evidence connections are verified against original research sources and field data.
        </p>
      </div>
    </aside>
  );
}

function Overview({ dashboard }) {
  const { metrics, recentOutreach } = dashboard;
  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
              Institutional Overview · Directorate Console
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
            Admin Dashboard
          </h1>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Manage polar research records, oversee station telemetry links, and monitor evidence-based learning activity.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 font-label-sm text-xs font-bold text-tertiary bg-tertiary-fixed/40 px-3 py-1 rounded-full w-fit">
          <ShieldCheck size={13} /> Demo Admin Session
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={BookOpenText} label="Research resources" value={metrics.resources} to="/admin/resources" />
        <Metric icon={Route} label="Expeditions" value={metrics.expeditions} to="/admin/expeditions" />
        <Metric icon={Database} label="Datasets" value={metrics.datasets} to="/admin/datasets" />
        <Metric icon={FileText} label="Publications" value={metrics.publications} to="/admin/publications" />
      </div>

      {/* Two Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
            <div>
              <h2 className="font-title-md text-body-md font-bold text-on-surface">Evidence Connections</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">Scientific provenance linkages mapped to source papers.</p>
            </div>
            <GitBranch size={18} className="text-primary shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/50 flex flex-col">
              <strong className="font-data-tabular text-2xl font-bold text-on-surface">{metrics.findings}</strong>
              <span className="font-label-sm text-xs text-outline font-medium">Mapped Findings</span>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/50 flex flex-col">
              <strong className="font-data-tabular text-2xl font-bold text-on-surface">{metrics.evidenceLinks}</strong>
              <span className="font-label-sm text-xs text-outline font-medium">Evidence Links</span>
            </div>
          </div>
          <Link to="/research" className="inline-flex items-center gap-1.5 font-label-sm text-xs font-semibold text-primary hover:text-primary-container mt-auto">
            Review research explorer <ArrowRight size={12} />
          </Link>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
            <div>
              <h2 className="font-title-md text-body-md font-bold text-on-surface">User Learning Activity</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">Student progress &amp; mission engagement metrics.</p>
            </div>
            <Users size={18} className="text-tertiary shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/50 flex flex-col">
              <strong className="font-data-tabular text-2xl font-bold text-on-surface">{metrics.users}</strong>
              <span className="font-label-sm text-xs text-outline font-medium">Registered Scholars</span>
            </div>
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high/50 flex flex-col">
              <strong className="font-data-tabular text-2xl font-bold text-on-surface">{metrics.userActivity}</strong>
              <span className="font-label-sm text-xs text-outline font-medium">Active Learners</span>
            </div>
          </div>
          <Link to="/admin/analytics" className="inline-flex items-center gap-1.5 font-label-sm text-xs font-semibold text-primary hover:text-primary-container mt-auto">
            View detailed analytics <ArrowRight size={12} />
          </Link>
        </section>
      </div>

      {/* Outreach Management Section */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
          <div>
            <h2 className="font-title-md text-body-md font-bold text-on-surface">Outreach Dissemination Drafts</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">{metrics.outreach} saved evidence-based outreach communication drafts.</p>
          </div>
          <Megaphone size={18} className="text-secondary shrink-0" />
        </div>

        {recentOutreach.length ? (
          <div className="flex flex-col divide-y divide-surface-container-high/60">
            {recentOutreach.map((item) => (
              <div key={item._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <strong className="font-title-sm text-xs font-bold text-on-surface truncate">
                    {item.title || item.format}
                  </strong>
                  <span className="font-body-sm text-[11px] text-outline truncate">
                    {item.researchResource?.title || 'Selected research context'} · {item.user?.name || 'Scholar'}
                  </span>
                </div>
                <span className="font-data-tabular text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-low border border-surface-container-high text-tertiary uppercase shrink-0">
                  {item.status || 'draft'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body-sm text-xs text-on-surface-variant py-4 text-center">
            No outreach drafts have been created yet.
          </p>
        )}
      </section>
    </div>
  );
}

function Records({ section }) {
  const [records, setRecords] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setRecords(null);
      getAdminRecords(section, { search, status }, controller.signal)
        .then(setRecords)
        .catch((requestError) => {
          if (requestError.name !== 'AbortError') setError(requestError.message);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [section, search, status]);

  async function changeStatus(id, nextStatus) {
    setSaving(id);
    setError('');
    try {
      await updateAdminRecordStatus(section, id, nextStatus);
      setRecords((current) => ({
        ...current,
        items: current.items.map((item) => (item._id === id ? { ...item, status: nextStatus } : item))
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving('');
    }
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
              Record Management · MoES Directory
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
            {labels[section]}
          </h1>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Review, edit publication state, and audit provenance integrity for {labels[section].toLowerCase()}.
          </p>
        </div>
        <span className="font-label-sm text-xs font-bold text-outline px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high w-fit">
          Directorate Admin
        </span>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3 bg-surface-container-low/70 border-b border-surface-container-high/60 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg flex-1 w-full text-xs">
            <Search size={14} className="text-outline shrink-0" />
            <input
              className="bg-transparent border-0 outline-none text-on-surface w-full"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${labels[section].toLowerCase()}…`}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-outline shrink-0" />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-xs font-medium text-on-surface outline-none w-full sm:w-auto"
            >
              <option value="">All states</option>
              {(records?.statuses || statusOptions).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="p-4 text-xs font-medium text-error bg-error/10 border-b border-error/20">{error}</p>}

        {!records ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-outline">
            <span className="loading-mark" />
            <span className="font-body-sm text-xs">Loading records…</span>
          </div>
        ) : records.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-xs">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-surface-container-high/60">
                  <th className="py-2.5 px-4 font-data-tabular uppercase font-bold text-outline text-[11px]">Record</th>
                  <th className="py-2.5 px-4 font-data-tabular uppercase font-bold text-outline text-[11px]">Context</th>
                  <th className="py-2.5 px-4 font-data-tabular uppercase font-bold text-outline text-[11px]">Updated</th>
                  <th className="py-2.5 px-4 font-data-tabular uppercase font-bold text-outline text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/50">
                {records.items.map((record) => (
                  <tr key={record._id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <strong className="block font-title-sm text-xs font-bold text-on-surface truncate">
                        {record.title || record.format || 'Untitled record'}
                      </strong>
                      <span className="block font-body-sm text-[11px] text-outline line-clamp-1 mt-0.5">
                        {record.description || record.abstract || record.content?.slice(0, 88) || 'Prototype Demo Content'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-data-tabular text-[11px] text-on-surface-variant">
                      {formatRecordMeta(record)}
                    </td>
                    <td className="py-3 px-4 font-data-tabular text-[11px] text-outline whitespace-nowrap">
                      {new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(record.updatedAt))}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={record.status || 'published'}
                        disabled={saving === record._id}
                        onChange={(event) => changeStatus(record._id, event.target.value)}
                        className="px-2.5 py-1 rounded bg-surface-container-low border border-surface-container-high text-[11px] font-semibold text-on-surface outline-none focus:ring-1 focus:ring-primary"
                      >
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-outline font-body-sm">No records match these filters.</p>
        )}
      </section>
    </div>
  );
}

function Analytics({ dashboard }) {
  const data = useMemo(
    () => [
      { name: 'Research', total: dashboard.metrics.resources },
      { name: 'Datasets', total: dashboard.metrics.datasets },
      { name: 'Expeditions', total: dashboard.metrics.expeditions },
      { name: 'Publications', total: dashboard.metrics.publications },
      { name: 'Mysteries', total: dashboard.metrics.mysteries }
    ],
    [dashboard]
  );

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
              Institutional Analytics · MoES Platform
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
            Research &amp; Learning Activity
          </h1>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Institutional collection totals, student participation indicators, and scientific provenance density.
          </p>
        </div>
        <span className="font-label-sm text-xs font-bold text-outline px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high w-fit">
          Telemetry &amp; Usage Metrics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={Users} label="Registered Scholars" value={dashboard.metrics.users} />
        <Metric icon={Activity} label="Active Learners" value={dashboard.metrics.userActivity} />
        <Metric icon={GitBranch} label="Evidence Links" value={dashboard.metrics.evidenceLinks} />
        <Metric icon={Megaphone} label="Outreach Drafts" value={dashboard.metrics.outreach} />
      </div>

      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
          <div>
            <h2 className="font-title-md text-body-md font-bold text-on-surface">Repository Coverage</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">Total indexed scientific records by primary content classification.</p>
          </div>
          <FlaskConical size={18} className="text-primary shrink-0" />
        </div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="total" fill="#1ea7e8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function TelemetryQAQC() {
  const stations = [
    {
      name: 'Bharati Station',
      region: 'Antarctica (Larsemann Hills)',
      coords: '69°24′S, 76°11′E',
      status: 'ONLINE',
      uptime: '100%',
      sensors: 'In-situ CTD Moorings, Fast-Ice Radar, Met-Tower AWS',
      provenance: 'Zero Broken Lineages',
      lastPacket: 'Just now'
    },
    {
      name: 'Himadri Station',
      region: 'Arctic (Ny-Ålesund, Svalbard)',
      coords: '78°55′N, 11°56′E',
      status: 'ONLINE',
      uptime: '99.8%',
      sensors: 'IndARC Physical Oceanography Mooring, Micro-pulse Lidar',
      provenance: 'Zero Broken Lineages',
      lastPacket: '2 min ago'
    },
    {
      name: 'Himansh Station',
      region: 'Himalaya (Spiti Valley, 4080m)',
      coords: '32°24′N, 77°37′E',
      status: 'ONLINE',
      uptime: '99.4%',
      sensors: 'Chhota Shigri Mass Balance Stakes, Snow Isotope Sampler',
      provenance: 'Zero Broken Lineages',
      lastPacket: '5 min ago'
    },
    {
      name: 'Maitri Station',
      region: 'Antarctica (Schirmacher Oasis)',
      coords: '70°45′S, 11°44′E',
      status: 'ONLINE',
      uptime: '100%',
      sensors: 'Priyadarshini Lake Limnology, Broadband Seismometer',
      provenance: 'Zero Broken Lineages',
      lastPacket: 'Just now'
    }
  ];

  const qaqcChecks = [
    { label: 'CF Metadata Conventions 1.8', standard: 'NetCDF-4 Schema Verification', status: '100% Passed' },
    { label: 'TEOS-10 Thermodynamic Oceanography', standard: 'CTD Pressure/Salinity Calibration', status: '100% Calibrated' },
    { label: 'Geospatial Projections', standard: 'EPSG:3031 & EPSG:3995 Validation', status: '100% Verified' },
    { label: 'Permanent DOI Ingestion', standard: 'DataCite REST / Crossref Resolver', status: 'Active (OAI-PMH)' },
    { label: 'Editorial Sensationalism Index', standard: 'MoES Dissemination Charter', status: '0 / 10 (Strict Empirical Framing)' },
    { label: 'Statutory Charter Compliance', standard: 'Indian Antarctic Act (2022)', status: 'Full Sovereign Compliance' }
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
              Institutional Directorate Portal
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
            Telemetry Linkage &amp; Dataset QA/QC
          </h1>
          <p className="font-body-md text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Real-time telemetry uplink monitoring and scientific data standards governance under NCPOR / MoES.
          </p>
        </div>
        <span className="font-label-sm text-xs font-bold text-tertiary bg-tertiary-fixed/40 px-3 py-1 rounded-full w-fit">
          MoES Sovereign Directorate
        </span>
      </div>

      {/* Triad Stations Section */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
          <div>
            <h2 className="font-title-md text-body-md font-bold text-on-surface">Polar Triad In-Situ Station Moorings</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">Direct telemetry uplinks across Antarctica, Arctic, and Himalaya.</p>
          </div>
          <Radio size={18} className="text-primary shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((st) => (
            <div key={st.name} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-title-sm text-body-sm font-bold text-on-surface">{st.name}</strong>
                <span className="font-data-tabular text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● {st.status} ({st.uptime})
                </span>
              </div>
              <span className="font-data-tabular text-[11px] text-outline font-medium">{st.region} · {st.coords}</span>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Sensors:</strong> {st.sensors}
              </p>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60 font-data-tabular text-[11px]">
                <span className="text-emerald-700 font-bold">✓ {st.provenance}</span>
                <span className="text-outline">Synced {st.lastPacket}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QA/QC Standards Section */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-container-high/60">
          <div>
            <h2 className="font-title-md text-body-md font-bold text-on-surface">Data Quality &amp; Standards Compliance (QA/QC)</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">Mandatory standards enforcement for open scientific repository assets.</p>
          </div>
          <ShieldCheck size={18} className="text-tertiary shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {qaqcChecks.map((check) => (
            <div key={check.label} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-1">
              <span className="font-title-sm text-xs font-bold text-on-surface">{check.label}</span>
              <p className="font-body-sm text-[11px] text-outline leading-tight">{check.standard}</p>
              <span className="font-data-tabular text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded w-fit mt-1.5">
                ✓ {check.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminPage({ section }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getAdminDashboard(controller.signal)
      .then(setDashboard)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          {/* Admin Sidebar */}
          <div className="lg:col-span-3">
            <AdminSidebar />
          </div>

          {/* Dynamic Content Pane */}
          <main className="lg:col-span-9 min-w-0">
            {!dashboard && !error && (
              <div className="p-12 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 flex flex-col items-center justify-center gap-3">
                <span className="loading-mark" />
                <p className="font-body-md text-xs text-on-surface-variant">Loading administration data…</p>
              </div>
            )}
            {error && (
              <div className="p-6 bg-surface-container-lowest rounded-2xl border border-error/20 text-error text-xs font-medium">
                {error}
              </div>
            )}
            {dashboard && (
              <>
                {!section && <Overview dashboard={dashboard} />}
                {section === 'telemetry' && <TelemetryQAQC />}
                {section === 'analytics' && <Analytics dashboard={dashboard} />}
                {section && section !== 'telemetry' && section !== 'analytics' && <Records section={section} />}
              </>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
