"use client";

/**
 * Studio Designs — every system designed in the Solar Design Studio,
 * with the full engineering + financial context for sales follow-up.
 */

import { useState, useEffect } from "react";
import {
  Search, Loader2, AlertCircle, Eye, X, Sun, MapPin, ExternalLink, Trash2,
} from "lucide-react";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtINR = (v) =>
  v || v === 0 ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-700",
  designed: "bg-sky-100 text-sky-800",
  proposal: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
};

function Row({ label, value }) {
  if (value === undefined || value === null || value === "" || value === "—") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default function SolarDesignsPage() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null); // full project doc
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/solar-design/projects");
      if (!res.ok) throw new Error("Failed to fetch studio designs");
      const data = await res.json();
      if (data.success) setDesigns(data.projects);
      else throw new Error(data.error || "Failed to fetch studio designs");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setSelected({ _id: id });
    try {
      const res = await fetch(`/api/solar-design/projects/${id}`);
      const data = await res.json();
      if (data.success) setSelected(data.project);
      else throw new Error(data.error);
    } catch (err) {
      alert("Failed to load design: " + err.message);
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/solar-design/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setDesigns(designs.map((d) => (d._id === id ? { ...d, status } : d)));
      }
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this design permanently?")) return;
    try {
      const res = await fetch(`/api/solar-design/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDesigns(designs.filter((d) => d._id !== id));
        setSelected(null);
      }
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const filtered = designs.filter(
    (d) =>
      d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button onClick={fetchDesigns} className="mt-4 text-green-600 hover:underline">
          Try Again
        </button>
      </div>
    );

  const loc = selected?.location;
  const mapsUrl =
    loc?.coordinates?.length === 2 && (loc.coordinates[0] || loc.coordinates[1])
      ? `https://maps.google.com/?q=${loc.coordinates[1]},${loc.coordinates[0]}`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-500" /> Studio Designs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Systems customers designed themselves — the warmest leads you have.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, address, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-medium">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 whitespace-nowrap">Location</th>
                <th className="px-4 py-3 whitespace-nowrap">System</th>
                <th className="px-4 py-3 whitespace-nowrap">Roof</th>
                <th className="px-4 py-3 whitespace-nowrap">Est. kWh/yr</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(d._id)}
                        className="font-medium text-gray-900 hover:text-green-700 hover:underline"
                      >
                        {d.customerName || "Anonymous"}
                      </button>
                      {d.customerPhone && (
                        <div className="text-xs text-gray-400">{d.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <div className="truncate" title={d.location?.address}>
                        {d.location?.city || d.location?.address || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {d.panelLayout?.systemSizeKW || 0} kW
                      <span className="text-xs text-gray-400 font-normal">
                        {" "}· {d.panelLayout?.panelCount || 0} panels
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {Math.round(d.roofMetrics?.totalArea || 0)} m²
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {(d.energyReport?.annualGeneration || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={d.status || "designed"}
                        onChange={(e) => updateStatus(d._id, e.target.value)}
                        disabled={updatingId === d._id}
                        className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none ${STATUS_STYLES[d.status] ?? STATUS_STYLES.designed} ${updatingId === d._id ? "opacity-50" : ""}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="designed">Designed</option>
                        <option value="proposal">Proposal</option>
                        <option value="approved">Approved</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(d._id)}
                          title="View full design"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          title="Delete design"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No studio designs yet. They appear here when customers save a
                    design in the Solar Design Studio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selected.customerName || "Anonymous design"}
                </h3>
                <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-5">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{selected.location?.address || "No address"}</span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 inline-flex items-center gap-1 whitespace-nowrap ml-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Maps
                    </a>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      System
                    </h4>
                    <Row label="DC capacity" value={`${selected.panelLayout?.systemSizeKW || 0} kW`} />
                    <Row label="Panels" value={`${selected.panelLayout?.panelCount || 0} × ${selected.panelSpecs?.wattage || 550} Wp`} />
                    <Row label="Roof area" value={`${Math.round(selected.roofMetrics?.totalArea || 0)} m²`} />
                    <Row label="Usable area" value={`${Math.round(selected.roofMetrics?.usableArea || 0)} m²`} />
                    <Row label="Roof type" value={selected.roof?.roofType === "pitched" ? `Pitched · ${selected.roof?.tiltDeg}°` : `Flat · racking ${selected.roof?.tiltDeg ?? 15}°`} />
                    <Row label="Obstacles" value={`${selected.obstacles?.length ?? 0}`} />
                    <Row
                      label="Confidence"
                      value={selected.confidence?.stars ? "★".repeat(selected.confidence.stars) + "☆".repeat(5 - selected.confidence.stars) : null}
                    />

                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-5 mb-2">
                      Customer inputs
                    </h4>
                    <Row
                      label="Usage"
                      value={
                        selected.electricityProfile?.mode !== "skipped" && selected.electricityProfile?.monthlyUnits
                          ? `${selected.electricityProfile.monthlyUnits} kWh/mo (₹${selected.electricityProfile.monthlyBill || 0})`
                          : "Skipped"
                      }
                    />
                    <Row label="Tariff" value={selected.electricityProfile?.tariff ? `₹${selected.electricityProfile.tariff}/kWh` : null} />
                    <Row label="Phone" value={selected.customerPhone} />
                    <Row label="Email" value={selected.customerEmail} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Production & Financials
                    </h4>
                    <Row label="Annual generation" value={`${(selected.energyReport?.annualGeneration || 0).toLocaleString("en-IN")} kWh`} />
                    <Row label="Specific yield" value={selected.energyReport?.specificYield ? `${selected.energyReport.specificYield} kWh/kWp (${selected.energyReport.yieldSource})` : null} />
                    <Row label="Gross cost" value={fmtINR(selected.energyReport?.financial?.grossCost)} />
                    <Row label="Subsidy" value={fmtINR(selected.energyReport?.financial?.subsidyAmount)} />
                    <Row label="Net cost" value={fmtINR(selected.energyReport?.financial?.netCost)} />
                    <Row label="First-year savings" value={fmtINR(selected.energyReport?.financial?.firstYearSavings)} />
                    <Row label="Payback" value={selected.energyReport?.financial?.paybackYears ? `${selected.energyReport.financial.paybackYears} years` : null} />
                    <Row label="25-yr savings" value={fmtINR(selected.energyReport?.financial?.lifetimeSavings)} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
