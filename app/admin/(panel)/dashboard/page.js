"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  MessageSquare, 
  FolderKanban, 
  FileText, 
  Loader2,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    enquiries: 0,
    newEnquiries: 0,
    projects: 0,
    blogs: 0
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Stats
        const statsRes = await fetch("/api/admin/stats");
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();

        // Fetch Enquiries
        const enquiriesRes = await fetch("/api/admin/enquiry");
        if (!enquiriesRes.ok) throw new Error("Failed to fetch enquiries");
        const enquiriesData = await enquiriesRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (enquiriesData.success) {
          // Take only the first 5 for recent enquiries
          setRecentEnquiries(enquiriesData.data.slice(0, 5));
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-500">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p>Error loading dashboard: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Enquiries",
      value: stats.enquiries,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "New Enquiries",
      value: stats.newEnquiries,
      icon: MessageSquare,
      color: "bg-green-500",
    },
    {
      title: "Total Projects",
      value: stats.projects,
      icon: FolderKanban,
      color: "bg-purple-500",
    },
    {
      title: "Total Blog Posts",
      value: stats.blogs,
      icon: FileText,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Enquiries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEnquiries.length > 0 ? (
                recentEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{enquiry.name}</td>
                    <td className="px-6 py-4">{enquiry.phone}</td>
                    <td className="px-6 py-4">{enquiry.city}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${enquiry.status === 'new' ? 'bg-green-100 text-green-800' : 
                          enquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {enquiry.status || 'new'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
