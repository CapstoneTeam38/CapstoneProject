import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertCircle,
  List,
  FileSearch,
  ShieldCheck,
  Activity,
  BarChart2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts',      icon: AlertCircle,     label: 'Live Alerts' },
  { to: '/transactions',icon: List,            label: 'Transactions' },
  { to: '/check',       icon: FileSearch,      label: 'Manual Check' },
  { to: '/cases',       icon: ShieldCheck,     label: 'Case Review' },
  { to: '/analytics',   icon: Activity,        label: 'Analytics' },
  { to: '/model-stats', icon: BarChart2,       label: 'Model Stats' },
];

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none';
const linkActive =
  'text-white bg-white/[0.07] shadow-inner';
const linkInactive =
  'hover:text-white hover:bg-white/5';

const SidebarContent = ({ onNavigate }) => (
  <div className="flex flex-col h-full" role="navigation" aria-label="Main Navigation">
    {/* Brand */}
    <BrandMark />

    {/* Divider */}
    <div className="mx-5 border-t border-white/[0.06] mb-4" aria-hidden="true" />

    {/* Navigation Links */}
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar" aria-label="Primary Nav">
      {NAV_LINKS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          aria-label={`Navigate to ${label}`}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Footer section */}
    <div className="px-3 pb-5 space-y-2">
      <div className="mx-2 border-t border-white/[0.06] mb-3" aria-hidden="true" />

      {/* Back to Classic Dashboard */}
      <a
        href="http://localhost:5000/dashboard"
        aria-label="Back to Classic Dashboard"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-slate-500 outline-none"
      >
        <ExternalLink size={14} aria-hidden="true" />
        <span>Classic Dashboard</span>
      </a>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  </div>
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#020617]/80 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col z-50 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#020617]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:hidden z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-extrabold tracking-widest uppercase text-white/90">
            NeuralGuard
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open Navigation Menu"
          aria-expanded={mobileOpen}
          className="text-slate-400 hover:text-white transition-colors p-2 focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none rounded-lg"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside 
            className="absolute inset-y-0 left-0 w-72 bg-[#020617]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col animate-slide-in shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Close button */}
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close Navigation Menu"
                className="text-slate-400 hover:text-white transition-colors p-2 focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
