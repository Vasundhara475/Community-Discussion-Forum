// client/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';
import { FaPlus, FaComments, FaEye, FaThumbsUp } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-blue-400">{user?.username}</span>! 👋
            </h1>
            <p className="text-gray-400 mt-1">Here's what's happening in your community</p>
          </div>
          <Link
            to="/create-discussion"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            <FaPlus /> New Discussion
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="bg-blue-900 p-3 rounded-lg">
                <FaComments className="text-blue-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">My Discussions</p>
                <p className="text-2xl font-bold">{data?.totalDiscussions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="bg-green-900 p-3 rounded-lg">
                <FaEye className="text-green-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold">
                  {data?.recentDiscussions?.reduce((sum, d) => sum + (d.views || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-900 p-3 rounded-lg">
                <FaThumbsUp className="text-yellow-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                <p className="text-lg font-bold">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Discussions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-4">My Recent Discussions</h2>
          {data?.recentDiscussions?.length > 0 ? (
            <div className="space-y-3">
              {data.recentDiscussions.map(d => (
                <Link
                  key={d._id}
                  to={`/discussions/${d._id}`}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition border border-gray-700"
                >
                  <div>
                    <p className="font-medium text-white">{d.title}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><FaEye />{d.views || 0}</span>
                    <span className="flex items-center gap-1"><FaComments />{d.comments?.length || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't created any discussions yet.</p>
              <Link
                to="/create-discussion"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
              >
                Create Your First Discussion
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;