// client/src/pages/DiscussionList.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDiscussions } from "../services/api";
import { FaThumbsUp, FaComments, FaEye, FaSearch, FaTag } from "react-icons/fa";

const CATEGORIES = [
  "all",
  "general",
  "help",
  "showcase",
  "offtopic",
  "announcement",
];

const DiscussionList = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (search) params.search = search;
        if (category !== "all") params.category = category;

        const res = await getDiscussions(params);
        if (!mounted) return;
        if (res.data.success) {
          setDiscussions(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch discussions:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // call asynchronously to avoid sync setState in effect body
    void load();

    return () => {
      mounted = false;
    };
  }, [page, search, category]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    // fetch immediately with page=1 to avoid stale state
    setLoading(true);
    try {
      const params = { page: 1, limit: 10 };
      if (search) params.search = search;
      if (category !== "all") params.category = category;
      const res = await getDiscussions(params);
      if (res.data.success) {
        setDiscussions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Discussions</h1>
          <Link
            to="/create-discussion"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            + New
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions..."
              className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discussion List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-5 animate-pulse h-24"
              />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaComments className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg">No discussions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((d) => (
              <Link
                key={d._id}
                to={`/discussions/${d._id}`}
                className="block bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-blue-500 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {d.isPinned && (
                      <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full mr-2">
                        📌 Pinned
                      </span>
                    )}
                    <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition truncate">
                      {d.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                      <span>
                        by{" "}
                        <span className="text-blue-400">
                          {d.author?.username}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      <span className="bg-gray-700 px-2 py-0.5 rounded-full capitalize text-xs">
                        {d.category}
                      </span>
                    </div>
                    {/* Tags */}
                    {d.tags?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {d.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded"
                          >
                            <FaTag className="text-xs" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-sm text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <FaThumbsUp />
                      {d.upvotes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaComments />
                      {d.comments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {d.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-300">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionList;
