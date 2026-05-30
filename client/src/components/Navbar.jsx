// client/src/components/Navbar.jsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaComments, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-300 transition">
            <FaComments />
            <span>ForumHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/discussions" className="hover:text-blue-400 transition font-medium">
              Discussions
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-400 transition font-medium">
                  Dashboard
                </Link>
                <Link
                  to="/create-discussion"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  + New Discussion
                </Link>
                <Link to={`/users/${user.username}`} className="flex items-center gap-2 hover:text-blue-400 transition">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-400 transition font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-gray-700 pt-3">
            <Link to="/discussions" onClick={() => setMenuOpen(false)} className="hover:text-blue-400 transition">
              Discussions
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-blue-400 transition">
                  Dashboard
                </Link>
                <Link to="/create-discussion" onClick={() => setMenuOpen(false)} className="hover:text-blue-400 transition">
                  + New Discussion
                </Link>
                <button onClick={handleLogout} className="text-red-400 text-left hover:text-red-300 transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-blue-400 transition">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="hover:text-blue-400 transition">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;