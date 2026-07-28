import { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { useToast } from "../../components/ToastNotification";
import {
  FiSearch,
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiEye,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";

const AdminMessages = () => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/contact/messages");
      if (res.data?.success) {
        setMessages(res.data.data || []);
      } else {
        toast.error(res.data?.message || "Failed to load contact messages.");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Error loading messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/contact/messages/${id}`, { status: newStatus });
      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === id ? { ...msg, status: newStatus } : msg))
        );
        if (selectedMessage?._id === id) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }
        toast.success(`Message marked as ${newStatus}.`);
      }
    } catch (err) {
      console.error("Error updating message status:", err);
      toast.error("Failed to update message status.");
    }
  };

  const handleViewMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      handleUpdateStatus(msg._id, "read");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/contact/messages/${messageToDelete._id}`);
      if (res.data?.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageToDelete._id));
        toast.success("Message deleted successfully.");
        if (selectedMessage?._id === messageToDelete._id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (statusFilter !== "ALL" && msg.status !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = (msg.name || "").toLowerCase().includes(term);
        const emailMatch = (msg.email || "").toLowerCase().includes(term);
        const subjectMatch = (msg.subject || "").toLowerCase().includes(term);
        const textMatch = (msg.message || "").toLowerCase().includes(term);
        if (!nameMatch && !emailMatch && !subjectMatch && !textMatch) return false;
      }
      return true;
    });
  }, [messages, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === "unread").length;
    const read = messages.filter((m) => m.status === "read").length;
    const replied = messages.filter((m) => m.status === "replied").length;
    return { total, unread, read, replied };
  }, [messages]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
            <FiClock size={12} /> Unread
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
            <FiCheckCircle size={12} /> Read
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <FiSend size={12} /> Replied
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text,#12131A)]">Contact Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and respond to messages submitted through the website contact form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Messages</span>
            <FiMail size={18} className="text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Unread</span>
            <FiClock size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-700">{stats.unread}</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Read</span>
            <FiCheckCircle size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">{stats.read}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Replied</span>
            <FiSend size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.replied}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, subject, or message..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
          {["ALL", "UNREAD", "READ", "REPLIED"].map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-20 text-center">
            <FiMessageCircle size={36} className="mx-auto text-gray-300" />
            <p className="mt-3 text-base font-semibold text-gray-700">No messages found</p>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search or filter settings."
                : "No customer contact messages submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Subject & Preview</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`transition hover:bg-gray-50/60 ${
                      msg.status === "unread" ? "bg-red-50/20 font-medium" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{msg.name}</div>
                        <div className="text-xs text-gray-400">{msg.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs sm:max-w-md">
                      <div className="truncate font-semibold text-gray-900">{msg.subject}</div>
                      <div className="truncate text-xs text-gray-500">{msg.message}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(msg.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewMessage(msg)}
                          title="View Message"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <FiEye size={16} />
                        </button>
                        <a
                          href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: " + msg.subject)}`}
                          title="Reply via Email"
                          onClick={() => handleUpdateStatus(msg._id, "replied")}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <FiSend size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setMessageToDelete(msg);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Message"
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>From: <strong className="text-gray-800">{selectedMessage.name}</strong> ({selectedMessage.email})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Status: {getStatusBadge(selectedMessage.status)}</span>
                <span>
                  {new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMessage._id, "unread")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                    selectedMessage.status === "unread"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Mark Unread
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMessage._id, "read")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                    selectedMessage.status === "read"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Mark Read
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedMessage._id, "replied")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                    selectedMessage.status === "replied"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Mark Replied
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent("Re: " + selectedMessage.subject)}`}
                onClick={() => handleUpdateStatus(selectedMessage._id, "replied")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-90"
              >
                <FiSend size={14} /> Reply Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Contact Message</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the message from <strong>{messageToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
