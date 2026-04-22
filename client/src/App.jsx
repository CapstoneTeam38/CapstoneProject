import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import Alerts from './pages/Alerts';
import CheckTransaction from './pages/CheckTransaction';
import CaseReview from './pages/CaseReview';
import Analytics from './pages/Analytics';
import ModelStats from './pages/ModelStats';
import UploadDataset from './pages/UploadDataset';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

const PagePlaceholder = ({ title }) => (
  <div className="glass-panel p-8 h-[60vh] flex flex-col items-center justify-center">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <p className="text-slate-400 text-center max-w-md">
      This route has been scaffolded successfully. The page logic will be implemented in future steps.
    </p>
  </div>
);

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {!isLoginPage && <Navbar />}

        {isLoginPage ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <main className="ml-0 md:ml-64 pt-14 md:pt-0 p-6 md:p-8 transition-all">
            <header className="mb-8 hidden md:block">
              <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold">Workspace</h2>
            </header>

            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/check" element={<ProtectedRoute><CheckTransaction /></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute><CaseReview /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/model-stats" element={<ProtectedRoute><ModelStats /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadDataset /></ProtectedRoute>} />
            </Routes>
          </main>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
