import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Send,
  Globe2,
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  Users,
  Ship,
  ArrowRight,
  Info
} from 'lucide-react';
import { submitContact } from '../services/apiClient.js';
import './MorePage.css';

const polarMilestones = [
  {
    year: '1981',
    title: 'First Indian Antarctic Expedition',
    desc: 'Historic expedition led by Dr. S. Z. Qasim aboard vessel MV Polar Circle, anchoring India sovereign presence in polar science.'
  },
  {
    year: '1983',
    title: 'Dakshin Gangotri Commissioned',
    desc: 'India first permanent scientific base established in Queen Maud Land ice shelf during the 3rd expedition.'
  },
  {
    year: '1989',
    title: 'Maitri Station Established',
    desc: 'Second permanent research base built on rocky Schirmacher Oasis, enabling multi-decadal geomagnetic and meteorological study.'
  },
  {
    year: '2008',
    title: 'Himadri Arctic Station Inaugurated',
    desc: 'India becomes an Arctic research nation with station opening at Ny-Ålesund, Svalbard, Norway at 79°N.'
  },
  {
    year: '2012',
    title: 'Bharati Station Commissioned',
    desc: 'Modern 134-container state-of-the-art green research facility commissioned in Larsemann Hills, East Antarctica.'
  },
  {
    year: '2014',
    title: 'IndARC Subsea Mooring Deployed',
    desc: 'India first underwater observatory anchored at 192m depth in Kongsfjorden fjord for continuous oceanic profiling.'
  },
  {
    year: '2016',
    title: 'Himansh Station (Third Pole)',
    desc: 'High-altitude observatory commissioned at 4,080m in Spiti Valley, Himalayas, completing the Indian Polar Triad.'
  },
  {
    year: '2024–2026',
    title: 'Year-Round Arctic Wintering',
    desc: 'Indian scientists complete maiden uninterrupted wintering across polar night darkness in the Arctic.'
  }
];

function MorePage({ defaultTab = 'about' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL or props
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/contact')) return 'contact';
    return defaultTab || 'about';
  });

  useEffect(() => {
    if (location.pathname.includes('/contact')) {
      setActiveTab('contact');
    } else if (location.pathname.includes('/about')) {
      setActiveTab('about');
    }
  }, [location.pathname]);

  // Contact form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('research');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'about') navigate('/more/about');
    if (tab === 'contact') navigate('/more/contact');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      const res = await submitContact({
        name,
        email,
        institution,
        subject,
        category,
        message
      });

      setSubmitSuccess(res.message || 'Your inquiry has been successfully dispatched.');
      setTicketId(res.ticketId || '');
      // Clear form
      setName('');
      setEmail('');
      setInstitution('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setSubmitError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="more-page w-full min-h-[calc(100vh-80px)] bg-surface-container-lowest flex flex-col">
      {/* 1. HEADER & SUB-NAVBAR */}
      <div className="border-b border-surface-container-high/80 bg-surface-container-low/50">
        <div className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg pt-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  MoES / NCPOR Institutional Charter
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight m-0">
                {activeTab === 'about' ? 'About Polar India Hub' : 'Contact NCPOR Secretariat'}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0 mt-1">
                {activeTab === 'about'
                  ? 'Four decades of Indian scientific excellence across Antarctica, the Arctic, and the Himalayas.'
                  : 'Submit scientific queries, expedition participation inquiries, and institutional collaborations.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-label-sm font-data-tabular shadow-2xs">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Government of India Sovereign Portal</span>
              </span>
            </div>
          </div>

          {/* 2 SUB NAVBAR TABS */}
          <div className="flex items-center gap-2 border-b border-surface-container-high" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              onClick={() => handleTabChange('about')}
              className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-title-md text-body-md font-semibold transition-all ${
                activeTab === 'about'
                  ? 'border-primary text-primary bg-surface-container-lowest'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container-high'
              }`}
            >
              <Building2 size={18} />
              <span>About Us</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'contact'}
              onClick={() => handleTabChange('contact')}
              className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-title-md text-body-md font-semibold transition-all ${
                activeTab === 'contact'
                  ? 'border-primary text-primary bg-surface-container-lowest'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container-high'
              }`}
            >
              <Mail size={18} />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENT AREA */}
      <div className="max-w-[1440px] w-full mx-auto px-margin-sm lg:px-margin-lg py-8 flex-1">
        {/* ===================== TAB 1: ABOUT US ===================== */}
        {activeTab === 'about' && (
          <div className="about-section flex flex-col gap-10">
            {/* Mission & Lineage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 text-primary font-label-sm font-bold uppercase tracking-wider">
                  <Compass size={16} />
                  <span>National Mandate</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight m-0">
                  National Centre for Polar and Ocean Research (NCPOR)
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed m-0">
                  The National Centre for Polar and Ocean Research (NCPOR), an autonomous research and development institution under the <strong>Ministry of Earth Sciences (MoES)</strong>, Government of India, is the nodal agency responsible for planning, promoting, coordinating, and executing the entire gamut of polar and Southern Ocean scientific activities.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed m-0">
                  Established in 1998 in Vasco-da-Gama, Goa, NCPOR governs India permanent stations across the globe—<strong>Bharati</strong> and <strong>Maitri</strong> in Antarctica, <strong>Himadri</strong> in the Arctic, and <strong>Himansh</strong> in the Western Himalayas—safeguarding sovereign polar data and contributing to global climate models under the Antarctic Treaty System.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-primary block">
                      44
                    </span>
                    <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                      Antarctic Expeditions
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-primary block">
                      17+
                    </span>
                    <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                      Arctic Campaigns
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-primary block">
                      1,400+
                    </span>
                    <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                      Peer-Reviewed Papers
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-primary block">
                      100%
                    </span>
                    <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">
                      Open Data Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Fleet & Triad Overview Card */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-high">
                    <Globe2 size={20} className="text-primary" />
                    <h3 className="font-title-md text-label-md font-bold text-on-surface m-0">
                      The Indian Polar Triad
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                        AQ
                      </div>
                      <div>
                        <strong className="font-title-md text-body-sm text-on-surface block">
                          Antarctic Realm (White Continent)
                        </strong>
                        <p className="font-body-sm text-label-sm text-on-surface-variant m-0">
                          Bharati &amp; Maitri stations monitoring ice-sheet dynamics, atmospheric physics, and Southern Ocean overturning.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        AR
                      </div>
                      <div>
                        <strong className="font-title-md text-body-sm text-on-surface block">
                          Arctic Domain (Svalbard)
                        </strong>
                        <p className="font-body-sm text-label-sm text-on-surface-variant m-0">
                          Himadri station &amp; IndARC mooring investigating Arctic amplification and Indian monsoon teleconnections.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        HM
                      </div>
                      <div>
                        <strong className="font-title-md text-body-sm text-on-surface block">
                          Himalayan Third Pole (Chandra Basin)
                        </strong>
                        <p className="font-body-sm text-label-sm text-on-surface-variant m-0">
                          Himansh observatory in Spiti Valley tracking glacier mass balance and headwater water security.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-label-sm text-outline flex items-center gap-2">
                    <Ship size={14} />
                    <span>Scientific Flagship: ORV Sagar Nidhi &amp; Polar Class Icebreakers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Milestones Timeline */}
            <div className="pt-6 border-t border-surface-container-high">
              <div className="flex items-center gap-2 mb-6">
                <Clock size={20} className="text-primary" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold m-0">
                  Four Decades of Sovereign Polar Milestones
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {polarMilestones.map((item) => (
                  <div
                    key={item.year}
                    className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-data-tabular text-sm font-extrabold text-primary px-2 py-0.5 rounded bg-surface-container-lowest border border-surface-container-high inline-block mb-2">
                        {item.year}
                      </span>
                      <h4 className="font-title-md text-body-sm font-bold text-on-surface mb-1">
                        {item.title}
                      </h4>
                      <p className="font-body-sm text-label-sm text-on-surface-variant leading-relaxed m-0">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: CONTACT US ===================== */}
        {activeTab === 'contact' && (
          <div className="contact-section grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Contact Form (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="p-6 sm:p-8 rounded-2xl border border-surface-container-high bg-surface-container-lowest shadow-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold m-0 mb-1">
                  Submit a Scientific Inquiry
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant m-0 mb-6">
                  Inquiries are logged directly into the NCPOR Secretariat queue. An automated confirmation ticket will be dispatched to your email.
                </p>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/20 text-error flex items-center gap-2 mb-5 font-body-sm text-body-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-tertiary-fixed/40 border border-tertiary/20 text-on-tertiary-fixed flex flex-col gap-1 mb-5 font-body-sm text-body-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={18} className="text-tertiary" />
                      <span>Inquiry Registered Successfully!</span>
                    </div>
                    <span>{submitSuccess}</span>
                    {ticketId && (
                      <span className="font-data-tabular font-bold text-xs mt-1">
                        Ticket Number: #{ticketId}
                      </span>
                    )}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-name" className="font-label-md text-label-md text-on-surface font-semibold">
                        Full Name &amp; Title *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Dr. / Prof. / Scholar Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-email" className="font-label-md text-label-md text-on-surface font-semibold">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="name@university.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-inst" className="font-label-md text-label-md text-on-surface font-semibold">
                        Institution / Affiliation
                      </label>
                      <input
                        id="contact-inst"
                        type="text"
                        placeholder="e.g. University / Research Center"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-cat" className="font-label-md text-label-md text-on-surface font-semibold">
                        Inquiry Category
                      </label>
                      <select
                        id="contact-cat"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                      >
                        <option value="research">Scientific Research Collaboration</option>
                        <option value="student">Student / NCERT Educational Program</option>
                        <option value="expedition">Expedition Call for Proposal (CFP)</option>
                        <option value="media">Media / Press Inquiries</option>
                        <option value="general">General Polar Secretariat Query</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="font-label-md text-label-md text-on-surface font-semibold">
                      Subject Line *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      placeholder="e.g. Cryospheric telemetry access request for Larsemann Hills"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-msg" className="font-label-md text-label-md text-on-surface font-semibold">
                      Detailed Message *
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={5}
                      required
                      placeholder="Please elaborate on your scientific intent, dataset requirement, or institutional inquiry…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full sm:w-auto self-start py-2.5 px-6 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <span>{submitting ? 'Submitting to Dispatch…' : 'Submit Scientific Inquiry'}</span>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Institutional Directory & Emergency Desks (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* HQ Address Card */}
              <div className="p-6 rounded-2xl border border-surface-container-high bg-surface-container-low shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-high">
                  <Building2 size={20} className="text-primary" />
                  <h3 className="font-title-md text-label-md font-bold text-on-surface m-0">
                    NCPOR Headquarters
                  </h3>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <div className="text-body-sm text-on-surface leading-relaxed">
                    <strong>National Centre for Polar and Ocean Research</strong><br />
                    Ministry of Earth Sciences, Govt. of India<br />
                    Headland Sada, Vasco-da-Gama<br />
                    Goa – 403 804, India
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 text-body-sm text-on-surface">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span>+91-832-2525600 / 2525601</span>
                </div>

                <div className="flex items-center gap-3 text-body-sm text-on-surface">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span>polar.secretariat@ncpor.gov.in</span>
                </div>
              </div>

              {/* Ministry Card */}
              <div className="p-6 rounded-2xl border border-surface-container-high bg-surface-container-low shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-surface-container-high">
                  <ShieldCheck size={20} className="text-primary" />
                  <h3 className="font-title-md text-label-md font-bold text-on-surface m-0">
                    Ministry of Earth Sciences (MoES)
                  </h3>
                </div>

                <div className="flex items-start gap-3 text-body-sm text-on-surface leading-relaxed">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    Prithvi Bhavan, Opposite India Habitat Centre<br />
                    Lodhi Road, New Delhi – 110 003, India
                  </div>
                </div>

                <div className="text-body-sm text-on-surface-variant pt-1 border-t border-surface-container-high/60">
                  Apex administrative authority overseeing national polar missions and Arctic/Antarctic treaty representation.
                </div>
              </div>

              {/* Field Logistics & Dispatch Notice */}
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary-container/10 flex items-start gap-3">
                <Info size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-title-md text-label-md font-bold text-on-surface m-0 mb-1">
                    Expedition Logistical Support
                  </h4>
                  <p className="font-body-sm text-label-sm text-on-surface-variant m-0 leading-relaxed">
                    Scientists selected for wintering or summer campaigns at Bharati, Maitri, or Himadri are coordinated via the NCPOR Polar Logistics Desk in Goa and Cape Town flight staging facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MorePage;
