// client/src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import { FaComments, FaCalendar } from 'react-icons/fa';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserProfile(username)
      .then(res => {
        if (res.data.success) setProfile(res.data.data);
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl mb-4">👤 {error}</p>
          <Link to="/discussions" className="text-blue-400 hover:underline">Browse Discussions</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-20 h-20 rounded-full border-2 border-blue-500"
            />
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-400 mt-1">{profile.bio || 'No bio yet.'}</p>
              <div className="flex gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FaCalendar />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <FaComments />
                  {profile.discussions?.length || 0} discussions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Discussions */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Discussions by {profile.username}</h2>
          {profile.discussions?.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No discussions yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.discussions?.map(d => (
                <Link
                  key={d._id}
                  to={`/discussions/${d._id}`}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition border border-gray-700"
                >
                  <p className="font-medium">{d.title}</p>
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <FaComments size={12} /> {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;