import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, List, FileSearch, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/alerts", icon: AlertCircle, label: "Live Alerts" },
    { to: "/transactions", icon: List, label: "Transactions" },
    { to: "/check", icon: FileSearch, label: "Manual Check" },
    { to: "/cases", icon: ShieldCheck, label: "Case Review" },
    { to: "/analytics", icon: Activity, label: "Analytics" },
    { to: "/model-stats", icon: BarChart2, label: "Model Stats" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#020617]/80 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white/90">
          NeuralGuard
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

// Placeholder components for routes
const PagePlaceholder = ({ title }) => (
  <div className="glass-panel p-8 h-[60vh] flex flex-col items-center justify-center">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <p className="text-slate-400 text-center max-w-md">
      This route has been scaffolded successfully. The page logic will be implemented in future steps.
    </p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 p-6 md:p-8 transition-all">
        <header className="mb-8 hidden md:block">
          <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold">Workspace</h2>
        </header>

        <Routes>
          <Route path="/" element={<PagePlaceholder title="Welcome to NeuralGuard" />} />
          <Route path="/dashboard" element={<PagePlaceholder title="Dashboard Overview" />} />
          <Route path="/alerts" element={<PagePlaceholder title="Live Threat Alerts" />} />
          <Route path="/transactions" element={<PagePlaceholder title="Transaction Ledger" />} />
          <Route path="/check" element={<PagePlaceholder title="Manual Transaction Check" />} />
          <Route path="/cases" element={<PagePlaceholder title="Case Review Queue" />} />
          <Route path="/analytics" element={<PagePlaceholder title="Deep Analytics" />} />
          <Route path="/model-stats" element={<PagePlaceholder title="Model Performance Stats" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
