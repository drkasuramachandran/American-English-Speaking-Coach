import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Mic, Languages, BarChart3, Settings } from 'lucide-react';

const links = [
  { to: '/', label: 'Coach', icon: LayoutDashboard, end: true },
  { to: '/practice/job-interview', label: 'Practice', icon: Mic, end: false, match: '/practice' },
  { to: '/translator', label: 'Translator', icon: Languages, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (link: (typeof links)[number]) => {
    if (link.match) return location.pathname.startsWith(link.match);
    if (link.end) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  return (
    <>
      {/* Top navigation (desktop + mobile brand bar) */}
      <header
        className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md"
        data-testid="top-nav"
      >
        <div className="app-container flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5" data-testid="nav-brand">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              American English <span className="text-brand-600">Coach</span>
            </span>
          </NavLink>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar (mobile only, < 640px) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden"
        data-testid="bottom-nav"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {links.map((link) => {
            const active = isActive(link);
            const Icon = link.icon;
            return (
              <NavLink
                key={link.label}
                to={link.to}
                data-testid={`bottom-nav-${link.label.toLowerCase()}`}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-brand-600' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
