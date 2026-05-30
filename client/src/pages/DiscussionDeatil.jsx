// client/src/pages/DiscussionDetail.jsx
// ─────────────────────────────────────────────────
// DISCUSSION DETAIL PAGE
// Shows full discussion + comments + real-time chat
// This page has both API calls AND Socket.IO
// ─────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getDiscussion,
  addComment,
  deleteComment,
  voteDiscussion,
  getMessages,
} from "../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../sockets/socket";
import toast from "react-hot-toast";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaComments,
  FaEye,
  FaTag,
  FaTrash,
  FaPaperPlane,
  FaUsers,
} from "react-icons/fa";

const DiscussionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Discussion and comments state
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingDiscussion, setLoadingDiscussion] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatConnected, setChatConnected] = useState(false);

  // Ref to auto-scroll chat to bottom
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const roomName = `room_${id}`;

  // ─────────────────────────────────────────────
  // LOAD DISCUSSION + CHAT HISTORY
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [discussionRes] = await Promise.all([getDiscussion(id)]);

        if (discussionRes.data.success) {
          setDiscussion(discussionRes.data.data);
          setComments(discussionRes.data.data.comments || []);
        }

        // Load chat history if logged in
        if (user) {
          try {
            const msgRes = await getMessages(roomName);
            if (msgRes.data.success) {
              setMessages(msgRes.data.data);
            }
          } catch {
            // Chat history not critical — proceed without it
          }
        }
      } catch {
        toast.error("Discussion not found");
        navigate("/discussions");
      } finally {
        setLoadingDiscussion(false);
      }
    };

    loadData();
  }, [id, user, navigate, roomName]);

  // ─────────────────────────────────────────────
  // SOCKET.IO — Real-time chat setup
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return; // Only connect if logged in

    const token = localStorage.getItem("token");

    // Connect socket with authentication
    const socket = connectSocket(token);

    socket.on("connect", () => {
      setChatConnected(true);
      // Join this discussion's chat room
      socket.emit("join_room", { room: roomName });
    });

    socket.on("disconnect", () => {
      setChatConnected(false);
    });

    // Someone joined the room
    socket.on("user_joined", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          content: data.message,
          type: "system",
          createdAt: data.timestamp,
        },
      ]);
    });

    // Someone left the room
    socket.on("user_left", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now() + 1,
          content: data.message,
          type: "system",
          createdAt: data.timestamp,
        },
      ]);
    });

    // Receive a new message — THIS is the key real-time event
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Online users in this room
    socket.on("room_users", (users) => {
      setOnlineUsers(users);
    });

    // Typing indicator
    socket.on("user_typing", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(username)) {
          return [...prev, username];
        } else {
          return prev.filter((u) => u !== username);
        }
      });
    });

    // Cleanup on component unmount (leaving the page)
    return () => {
      if (getSocket()) {
        getSocket().emit("leave_room", { room: roomName });
      }
      disconnectSocket();
      setChatConnected(false);
    };
  }, [user, roomName]);

  // Auto-scroll chat to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─────────────────────────────────────────────
  // SEND CHAT MESSAGE
  // ─────────────────────────────────────────────
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socket = getSocket();
    if (!socket || !chatConnected) {
      toast.error("Chat not connected");
      return;
    }

    // Emit message to server — server will broadcast to all in room
    socket.emit("send_message", {
      room: roomName,
      content: newMessage.trim(),
    });

    setNewMessage("");

    // Stop typing indicator
    socket.emit("typing", { room: roomName, isTyping: false });
  };

  // ─────────────────────────────────────────────
  // TYPING INDICATOR
  // ─────────────────────────────────────────────
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    // Tell others you're typing
    socket.emit("typing", { room: roomName, isTyping: true });

    // Stop "typing" signal after 2 seconds of no typing
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { room: roomName, isTyping: false });
    }, 2000);
  };

  // ─────────────────────────────────────────────
  // ADD COMMENT
  // ─────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await addComment(id, { content: newComment });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setNewComment("");
        toast.success("Comment added!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  // ─────────────────────────────────────────────
  // VOTE
  // ─────────────────────────────────────────────
  const handleVote = async (type) => {
    if (!user) {
      toast.error("Login to vote");
      return;
    }
    try {
      const res = await voteDiscussion(id, type);
      if (res.data.success) {
        setDiscussion((prev) => ({
          ...prev,
          upvotes: Array(res.data.data.upvotes).fill(null),
          downvotes: Array(res.data.data.downvotes).fill(null),
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to vote");
    }
  };

  if (loadingDiscussion) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!discussion) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Two-column layout: Discussion + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── LEFT COLUMN: Discussion + Comments ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discussion Post */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              {/* Category + Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1 rounded-full capitalize">
                  {discussion.category}
                </span>
                {discussion.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full"
                  >
                    <FaTag className="text-xs" /> {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {discussion.title}
              </h1>

              {/* Author info */}
              <div className="flex items-center gap-3 mb-6 text-sm text-gray-400">
                <img
                  src={
                    discussion.author?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${discussion.author?.username}`
                  }
                  alt={discussion.author?.username}
                  className="w-8 h-8 rounded-full"
                />
                <Link
                  to={`/users/${discussion.author?.username}`}
                  className="text-blue-400 hover:underline"
                >
                  {discussion.author?.username}
                </Link>
                <span>•</span>
                <span>
                  {new Date(discussion.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <FaEye /> {discussion.views}
                </span>
              </div>

              {/* Content */}
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </div>

              {/* Vote Buttons */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleVote("upvote")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-green-900 hover:text-green-400 rounded-lg transition"
                >
                  <FaThumbsUp /> {discussion.upvotes?.length || 0}
                </button>
                <button
                  onClick={() => handleVote("downvote")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900 hover:text-red-400 rounded-lg transition"
                >
                  <FaThumbsDown /> {discussion.downvotes?.length || 0}
                </button>
                <span className="text-gray-400 flex items-center gap-1 ml-auto">
                  <FaComments /> {comments.length} comments
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-5">
                Comments ({comments.length})
              </h2>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none mb-3"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-5 py-2 rounded-lg font-medium transition"
                  >
                    Post Comment
                  </button>
                </form>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center text-gray-400">
                  <Link to="/login" className="text-blue-400 hover:underline">
                    Login
                  </Link>{" "}
                  to post a comment
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map(
                    (comment) =>
                      !comment.isDeleted && (
                        <div
                          key={comment._id}
                          className="flex gap-3 p-4 bg-gray-800 rounded-lg"
                        >
                          <img
                            src={
                              comment.author?.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.username}`
                            }
                            alt={comment.author?.username}
                            className="w-9 h-9 rounded-full shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                to={`/users/${comment.author?.username}`}
                                className="font-medium text-blue-400 hover:underline text-sm"
                              >
                                {comment.author?.username}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}
                              </span>
                              {user && comment.author?._id === user.id && (
                                <button
                                  onClick={async () => {
                                    await deleteComment(comment._id);
                                    setComments((prev) =>
                                      prev.filter((c) => c._id !== comment._id),
                                    );
                                    toast.success("Comment deleted");
                                  }}
                                  className="ml-auto text-red-400 hover:text-red-300"
                                >
                                  <FaTrash size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-gray-200 text-sm">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Real-Time Chat ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-150 sticky top-20">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  💬 Live Chat
                  {chatConnected && (
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  {onlineUsers.length} online
                </p>
              </div>
              {onlineUsers.length > 0 && (
                <div className="flex items-center gap-1">
                  <FaUsers className="text-gray-400 text-sm" />
                  <div className="flex -space-x-1">
                    {onlineUsers.slice(0, 3).map((u, i) => (
                      <img
                        key={i}
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                        alt={u.username}
                        className="w-6 h-6 rounded-full border border-gray-800"
                        title={u.username}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages Area */}
            {user ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-10">
                      No messages yet. Say hello! 👋
                    </p>
                  )}
                  {messages.map((msg, i) => (
                    <div key={msg._id || i}>
                      {msg.type === "system" ? (
                        /* System message (user joined/left) */
                        <div className="text-center">
                          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      ) : (
                        /* Regular chat message */
                        <div
                          className={`flex gap-2 ${msg.sender?._id === user.id ? "flex-row-reverse" : ""}`}
                        >
                          <img
                            src={
                              msg.sender?.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.username}`
                            }
                            alt={msg.sender?.username}
                            className="w-7 h-7 rounded-full shrink-0"
                          />
                          <div
                            className={`max-w-[75%] ${msg.sender?._id === user.id ? "items-end" : "items-start"} flex flex-col`}
                          >
                            {msg.sender?._id !== user.id && (
                              <span className="text-xs text-blue-400 mb-1">
                                {msg.sender?.username}
                              </span>
                            )}
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm ${
                                msg.sender?._id === user.id
                                  ? "bg-blue-600 rounded-tr-sm"
                                  : "bg-gray-800 rounded-tl-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Auto-scroll target */}
                  <div ref={chatEndRef} />
                </div>

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="px-4 pb-1 text-xs text-gray-400 italic">
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                  </div>
                )}

                {/* Message Input */}
                <div className="p-3 border-t border-gray-800">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      maxLength={1000}
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !chatConnected}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 p-2 rounded-lg transition"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6 text-gray-400">
                <div>
                  <p className="text-4xl mb-3">💬</p>
                  <p className="mb-3">Login to join the live chat</p>
                  <Link to="/login" className="text-blue-400 hover:underline">
                    Login here →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
