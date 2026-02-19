import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import GoalDetail from './pages/GoalDetail';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import MenuBar from './components/MenuBar';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <MenuBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/goals/:goalId" element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
