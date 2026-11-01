import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import IssueRadio from './pages/IssueRadio';
import ReturnRadio from './pages/ReturnRadio';
import RadioRegister from './pages/RadioRegister';
import SoldierRegister from './pages/SoldierRegister';
import SoldierProfile from './pages/SoldierProfile';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="issue-radio" element={<IssueRadio />} />
          <Route path="return-radio" element={<ReturnRadio />} />
          <Route path="radio-register" element={<RadioRegister />} />
          <Route path="soldier-register" element={<SoldierRegister />} />
          <Route path="soldier/:id" element={<SoldierProfile />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
