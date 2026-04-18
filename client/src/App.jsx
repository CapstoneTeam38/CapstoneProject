import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';

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
      <Navbar />

      {/* Main content — offset for desktop sidebar (ml-64) and mobile top bar (pt-14) */}
      <main className="ml-0 md:ml-64 pt-14 md:pt-0 p-6 md:p-8 transition-all">
        <header className="mb-8 hidden md:block">
          <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold">Workspace</h2>
        </header>

        <Routes>
          <Route path="/" element={<PagePlaceholder title="Welcome to NeuralGuard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<PagePlaceholder title="Live Threat Alerts" />} />
          <Route path="/transactions" element={<TransactionHistory />} />
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
