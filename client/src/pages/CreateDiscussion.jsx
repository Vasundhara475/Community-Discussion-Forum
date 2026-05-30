// client/src/pages/CreateDiscussion.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDiscussion } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['general', 'help', 'showcase', 'offtopic', 'announcement'];

const CreateDiscussion = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5) return toast.error('Title must be at least 5 characters');
    if (formData.content.length < 10) return toast.error('Content must be at least 10 characters');

    setLoading(true);
    try {
      const res = await createDiscussion(formData);
      if (res.data.success) {
        toast.success('Discussion created! 🎉');
        navigate(`/discussions/${res.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Discussion</h1>
        <p className="text-gray-400 mb-8">Start a new conversation with the community</p>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your discussion about?"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe your topic in detail..."
              required
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="javascript, react, help (comma separated)"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Creating...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussion;