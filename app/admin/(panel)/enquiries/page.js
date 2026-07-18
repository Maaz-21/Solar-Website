"use client";

import { useState, useEffect } from "react";
import {
  Search, Loader2, AlertCircle, Filter, Eye, X, Download, Mail,
  MessageCircle, Send, Sun, MapPin, Zap, Home, IndianRupee, ExternalLink,
} from "lucide-react";
import { toast } from "@/components/Toaster";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function SourceBadge({ enquiry }) {
  const isStudio = enquiry.solarDesign?.source === "design-studio";
  return isStudio ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      <Sun className="w-3 h-3" /> Studio
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      Website
    </span>
  );
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyData, setReplyData] = useState({ id: null, email: "", subject: "", message: "" });
  const [sendingReply, setSendingReply] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/enquiry");
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      const data = await res.json();
      if (data.success) setEnquiries(data.data);
      else throw new Error(data.error || "Failed to fetch enquiries");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openReplyModal = (enquiry) => {
    setReplyData({
      id: enquiry._id,
      email: enquiry.email,
      subject: `Re: Enquiry from ${enquiry.name}`,
      message: `Hi ${enquiry.name},\n\nThank you for your enquiry regarding solar installation.\n\n`,
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
          message: replyData.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply sent successfully!");
        setReplyModalOpen(false);
        fetchEnquiries();
      } else {
        throw new Error(data.error || "Failed to send reply");
      }
    } catch (err) {
      toast.error("Error: " + err.message);
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
      toast.error("Export failed: " + err.message);
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
        setEnquiries(enquiries.map((enq) => (enq._id === id ? { ...enq, status: newStatus } : enq)));
      }
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.phone?.includes(searchTerm) ||
      enq.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || enq.status === statusFilter;
    const isStudio = enq.solarDesign?.source === "design-studio";
    const matchesSource =
      sourceFilter === "all" || (sourceFilter === "studio" ? isStudio : !isStudio);
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p>{error}</p>
        <button onClick={fetchEnquiries} className="mt-4 text-green-600 hover:underline">
          Try Again
        </button>
      </div>
    );

  const design = selectedLead?.solarDesign;
  const hasDesign = design?.source === "design-studio";
  const mapsUrl =
    hasDesign && design.coordinates?.length === 2
      ? `https://maps.google.com/?q=${design.coordinates[1]},${design.coordinates[0]}`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries Management</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
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
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-full sm:w-60"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none bg-white cursor-pointer text-sm"
          >
            <option value="all">All Sources</option>
            <option value="studio">Design Studio</option>
            <option value="website">Website</option>
          </select>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none bg-white cursor-pointer text-sm"
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
                <th className="px-4 py-3 whitespace-nowrap">Lead</th>
                <th className="px-4 py-3 whitespace-nowrap">Contact</th>
                <th className="px-4 py-3 whitespace-nowrap">City</th>
                <th className="px-4 py-3 whitespace-nowrap">Source</th>
                <th className="px-4 py-3 whitespace-nowrap">System / Bill</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enquiry) => {
                  const isStudio = enquiry.solarDesign?.source === "design-studio";
                  return (
                    <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead(enquiry)}
                          className="font-medium text-gray-900 hover:text-green-700 hover:underline"
                        >
                          {enquiry.name}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>{enquiry.phone}</div>
                        <div className="text-xs text-gray-400">{enquiry.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{enquiry.city || "—"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <SourceBadge enquiry={enquiry} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isStudio ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {enquiry.solarDesign.systemSizeKW} kW · {enquiry.solarDesign.panelCount} panels
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.round(enquiry.solarDesign.roofAreaM2)} m² roof
                            </div>
                          </div>
                        ) : (
                          <span>{enquiry.billRange || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{fmtDate(enquiry.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={enquiry.status || "new"}
                            onChange={(e) => handleStatusUpdate(enquiry._id, e.target.value)}
                            disabled={updatingId === enquiry._id}
                            className={`
                              appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1
                              ${enquiry.status === "new" ? "bg-green-100 text-green-800 focus:ring-green-500" :
                                enquiry.status === "contacted" ? "bg-blue-100 text-blue-800 focus:ring-blue-500" :
                                "bg-gray-100 text-gray-800 focus:ring-gray-500"}
                              ${updatingId === enquiry._id ? "opacity-50 cursor-wait" : ""}
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedLead(enquiry)}
                            title="View full lead details"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openReplyModal(enquiry)}
                            disabled={!enquiry.email}
                            title={enquiry.email ? "Reply via Email" : "No email available"}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${enquiry.phone?.replace(/\D/g, "")}`}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{selectedLead.name}</h3>
              <SourceBadge enquiry={selectedLead} />
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Enquired {fmtDate(selectedLead.createdAt)} · status: {selectedLead.status || "new"}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact + message */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Contact
                </h4>
                <DetailRow label="Phone" value={selectedLead.phone} />
                <DetailRow label="Email" value={selectedLead.email} />
                <DetailRow label="City" value={selectedLead.city} />
                <DetailRow label="Pincode" value={selectedLead.pincode} />
                <DetailRow label="Bill range" value={selectedLead.billRange} />

                {selectedLead.message && (
                  <>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-5 mb-2">
                      Message
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                      {selectedLead.message}
                    </div>
                  </>
                )}

                {selectedLead.replies?.length > 0 && (
                  <>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-5 mb-2">
                      Replies sent ({selectedLead.replies.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedLead.replies.map((reply, i) => (
                        <div key={i} className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-gray-700">
                          <div className="font-semibold mb-1">{reply.subject}</div>
                          <div className="whitespace-pre-wrap line-clamp-3">{reply.message}</div>
                          <div className="text-gray-400 mt-1">{fmtDate(reply.repliedAt)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Studio design context */}
              <div>
                {hasDesign ? (
                  <>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" /> Design Studio Data
                    </h4>
                    <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3">
                      <div className="flex items-start gap-2 pb-2 mb-1 border-b border-amber-100 text-sm">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-gray-800">{design.address || "—"}</span>
                      </div>
                      <DetailRow label="Roof area" value={`${Math.round(design.roofAreaM2 || 0)} m²`} />
                      <DetailRow label="Usable area" value={`${Math.round(design.usableAreaM2 || 0)} m²`} />
                      <DetailRow
                        label="System designed"
                        value={`${design.systemSizeKW || 0} kW · ${design.panelCount || 0} panels`}
                      />
                      <DetailRow
                        label="Est. generation"
                        value={`${(design.estimatedAnnualKWh || 0).toLocaleString("en-IN")} kWh/yr`}
                      />
                      <DetailRow
                        label="Usage entered"
                        value={
                          design.monthlyUnits
                            ? `${design.monthlyUnits} kWh/mo (₹${design.monthlyBill || 0})`
                            : "Skipped"
                        }
                      />
                      <DetailRow label="Tariff" value={design.tariff ? `₹${design.tariff}/kWh` : null} />
                      <DetailRow label="Coverage goal" value={design.coverage ? `${design.coverage}%` : null} />
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open roof location in Google Maps
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      The customer designed this system themselves — reference these
                      numbers when preparing the formal quote.
                    </p>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 rounded-lg p-6">
                    <Home className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">Website enquiry — no design data attached.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <a
                href={`https://wa.me/${selectedLead.phone?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-medium text-sm flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <button
                onClick={() => {
                  openReplyModal(selectedLead);
                  setSelectedLead(null);
                }}
                disabled={!selectedLead.email}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2 disabled:opacity-40"
              >
                <Mail className="w-4 h-4" /> Reply by Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-2xl">
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
                  onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows="6"
                  value={replyData.message}
                  onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
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
