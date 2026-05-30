// client/src/App.jsx
// ─────────────────────────────────────────────────
// MAIN APP COMPONENT
// Defines all routes in the application
// ─────────────────────────────────────────────────

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDiscussion from './pages/CreateDiscussion';
import DiscussionList from './pages/DiscussionList';
import DiscussionDetail from './pages/DiscussionDeatil';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Import layout
import Navbar from './components/Navbar';

// Protected Route — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route — redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/discussions" element={<DiscussionList />} />
        <Route path="/discussions/:id" element={<DiscussionDetail />} />
        <Route path="/users/:username" element={<Profile />} />

        {/* Public only — redirect if logged in */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected — must be logged in */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-discussion" element={<ProtectedRoute><CreateDiscussion /></ProtectedRoute>} />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toast notifications — appears in corner of screen */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;