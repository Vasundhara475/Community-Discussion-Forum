// client/src/pages/NotFound.jsx

import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-8xl font-bold text-blue-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold transition">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;