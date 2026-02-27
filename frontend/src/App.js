// frontend/src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import AIChecker from './pages/AIChecker';
import Emergency from './pages/Emergency';
import Analytics from './pages/Analytics';  // Changed from Business to Analytics
import Transactions from './pages/Transactions';
// import Business from './pages/Business';  // Removed - no longer needed

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/ai-checker" element={<AIChecker />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/analytics" element={<Analytics />} />  {/* Changed from /business to /analytics */}
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;