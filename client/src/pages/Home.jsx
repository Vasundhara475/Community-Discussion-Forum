// client/src/pages/Home.jsx

import { Link } from "react-router-dom";
import { FaComments, FaBolt, FaUsers, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FaComments className="text-blue-400 text-3xl" />,
      title: "Discussion Forums",
      desc: "Create and join topic-based discussions with voting and comments.",
    },
    {
      icon: <FaBolt className="text-yellow-400 text-3xl" />,
      title: "Real-Time Chat",
      desc: "Chat instantly with community members — powered by Socket.IO.",
    },
    {
      icon: <FaUsers className="text-green-400 text-3xl" />,
      title: "Community",
      desc: "Connect with developers, students, and professionals worldwide.",
    },
    {
      icon: <FaShieldAlt className="text-purple-400 text-3xl" />,
      title: "Secure Auth",
      desc: "JWT-based authentication keeps your account safe.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Where Communities
            <span className="text-blue-400"> Discuss & Chat</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            A full-stack community platform for creating discussions, sharing
            ideas, and chatting in real-time with people who share your
            interests.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/discussions"
                  className="border border-gray-600 hover:border-blue-400 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
                >
                  Browse Discussions
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">
            Everything you need for community engagement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 hover:scale-105 transition-all duration-200 border border-gray-700"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to join the conversation?
        </h2>
        <p className="text-gray-400 mb-8">
          Join thousands of users discussing topics that matter.
        </p>
        <Link
          to="/discussions"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition inline-block"
        >
          Browse All Discussions
        </Link>
      </section>
    </div>
  );
};

export default Home;
