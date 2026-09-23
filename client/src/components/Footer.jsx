import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.svg';

function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-2px_12px_rgba(11,31,51,0.03)] mt-space-2xl border-t border-surface-container-high/60" role="contentinfo">
      <div className="w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg">
          {/* Brand & Authority Overview */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img
                alt="Polar India Hub 2.0 Logo"
                className="h-7 w-auto object-contain"
                src={logoIcon}
              />
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                POLAR INDIA HUB
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md leading-relaxed">
              Official Scientific &amp; Cryospheric Repository overseen by the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Government of India. Providing peer-reviewed telemetry, ice-core databanks, and multi-pole expedition intelligence.
            </p>
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container mr-1.5"></span>
                MoES Accredited
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                Scientific Integrity Standard ISO-27001
              </span>
            </div>
          </div>

          {/* Column 2: Station Portals */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-title-md text-body-md text-on-surface font-semibold">
              Station Portals
            </span>
            <ul className="flex flex-col gap-space-xs list-none p-0 m-0">
              <li>
                <Link
                  to="/stations"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Antarctica: Bharati Station
                </Link>
              </li>
              <li>
                <Link
                  to="/stations"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Antarctica: Maitri Station
                </Link>
              </li>
              <li>
                <Link
                  to="/stations"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Arctic: Himadri Observatory
                </Link>
              </li>
              <li>
                <Link
                  to="/stations"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Himalayas: Himansh Third Pole
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Scientific Resources */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-title-md text-body-md text-on-surface font-semibold">
              Scientific Resources
            </span>
            <ul className="flex flex-col gap-space-xs list-none p-0 m-0">
              <li>
                <Link
                  to="/publications"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Citation &amp; DOI Guidelines
                </Link>
              </li>
              <li>
                <a
                  href="https://npdc.ncpor.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Open Cryosphere API
                </a>
              </li>
              <li>
                <Link
                  to="/datasets"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Core Sample Repositories
                </Link>
              </li>
              <li>
                <Link
                  to="/research"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Peer Review Protocols
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Ethics */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-title-md text-body-md text-on-surface font-semibold">
              Governance &amp; Ethics
            </span>
            <ul className="flex flex-col gap-space-xs list-none p-0 m-0">
              <li>
                <a
                  href="https://www.ats.aq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Antarctic Treaty Compliance
                </a>
              </li>
              <li>
                <Link
                  to="/research"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Scientific Ethics Charter
                </Link>
              </li>
              <li>
                <Link
                  to="/expeditions"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Environmental Protocols
                </Link>
              </li>
              <li>
                <Link
                  to="/datasets"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Data Governance &amp; Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-space-xl pt-space-md border-t border-surface-container-high/60 flex flex-col md:flex-row items-center justify-between gap-space-sm text-outline">
          <p className="font-label-sm text-label-sm m-0">
            © 2026 National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt of India. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm">
            <span className="hover:text-on-surface cursor-pointer transition-colors">
              Smart India Hackathon 2026 (PS 26063)
            </span>
            <span>·</span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">
              Accessibility
            </span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">
              Security Policy
            </span>
            <span className="hover:text-on-surface cursor-pointer transition-colors">
              Open Data Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
