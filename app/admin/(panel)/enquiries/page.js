"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, Filter, Eye, X, Download, Mail, MessageCircle, Send } from "lucide-react";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyData, setReplyData] = useState({ id: null, email: "", subject: "", message: "" });
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/enquiry");
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch enquiries");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (enquiry) => {
    setReplyData({
      id: enquiry._id,
      email: enquiry.email,
      subject: `Re: Enquiry from ${enquiry.name}`,
      message: `Hi ${enquiry.name},\n\nThank you for your enquiry regarding solar installation.\n\n`
    });
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/enquiry/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: replyData.id,
          subject: replyData.subject,
          message: replyData.message
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Reply sent successfully!");
        setReplyModalOpen(false);
        fetchEnquiries(); // Refresh list to update status if changed
      } else {
        throw new Error(data.error || "Failed to send reply");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/admin/enquiry/export");
      if (!res.ok) throw new Error("Failed to export");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "enquiries.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/enquiry/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();
      if (data.success) {
        setEnquiries(enquiries.map(enq => 
          enq._id === id ? { ...enq, status: newStatus } : enq
        ));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enq.phone?.includes(searchTerm) ||
                         enq.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enq.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 text-red-500">
      <AlertCircle className="w-10 h-10 mb-2" />
      <p>{error}</p>
      <button onClick={fetchEnquiries} className="mt-4 text-green-600 hover:underline">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 text-sm font-medium whitespace-nowrap"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, phone, city, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-full sm:w-64"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-medium">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 whitespace-nowrap">City</th>
                <th className="px-4 py-3 whitespace-nowrap">Pincode</th>
                <th className="px-4 py-3 whitespace-nowrap">Bill Range</th>
                <th className="px-4 py-3 whitespace-nowrap">Message</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{enquiry.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{enquiry.phone}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{enquiry.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{enquiry.city}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{enquiry.pincode}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{enquiry.billRange}</td>
                    <td className="px-4 py-4">
                      {enquiry.message ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[150px] block" title={enquiry.message}>
                            {enquiry.message}
                          </span>
                          <button 
                            onClick={() => setSelectedMessage(enquiry.message)}
                            className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded">
                            <Eye className="w-4 h-4" />
                            </button>
                        </div>
                        ) : (
                        <span className="text-gray-400 italic">No message</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={enquiry.status || 'new'}
                          onChange={(e) => handleStatusUpdate(enquiry._id, e.target.value)}
                          disabled={updatingId === enquiry._id}
                          className={`
                            appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1
                            ${enquiry.status === 'new' ? 'bg-green-100 text-green-800 focus:ring-green-500' : 
                              enquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' : 
                              'bg-gray-100 text-gray-800 focus:ring-gray-500'}
                            ${updatingId === enquiry._id ? 'opacity-50 cursor-wait' : ''}
                          `}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        {updatingId === enquiry._id && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openReplyModal(enquiry)}
                          disabled={!enquiry.email}
                          title={enquiry.email ? "Reply via Email" : "No email available"}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${enquiry.phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedMessage(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Full Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto border border-gray-100 text-sm leading-relaxed">
              {selectedMessage}
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setReplyModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Reply to Enquiry</h3>
            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input 
                  type="text" 
                  value={replyData.email} 
                  disabled 
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={replyData.subject}
                  onChange={(e) => setReplyData({...replyData, subject: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows="6"
                  value={replyData.message}
                  onChange={(e) => setReplyData({...replyData, message: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={sendingReply}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
