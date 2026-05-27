"use client";

import { useEffect, useState } from "react";

interface Provider {
  id: number;
  name: string;
  monthlyQuota: number;
  leadsCount: number;
  leadAssignments: {
    lead: {
      id: number;
      name: string;
      phone: string;
      city: string;
      description: string;
      service: { name: string };
    };
  }[];
}

export default function DashboardPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        // ✅ FIX: ensure array is always passed
        setProviders(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const eventSource = new EventSource("/api/sse");
    eventSource.onmessage = () => {
      fetchDashboard();
    };

    const interval = setInterval(fetchDashboard, 5000);

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-lg text-xl font-semibold text-gray-700">
          Loading Dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">

      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-gray-800">
          Prowider Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Real-time Lead Distribution Monitoring System
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-xl font-semibold opacity-90">
            Total Providers
          </h2>
          <p className="text-5xl mt-4 font-extrabold">
            {providers.length}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-xl font-semibold opacity-90">
            Total Leads
          </h2>
          <p className="text-5xl mt-4 font-extrabold">
            {providers.reduce((sum, p) => sum + (p.leadsCount || 0), 0)}
          </p>
        </div>

      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Providers
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-black text-white">
              <tr>
                <th className="p-4 text-left">Provider</th>
                <th className="p-4 text-left">Leads Assigned</th>
                <th className="p-4 text-left">Remaining Quota</th>
                <th className="p-4 text-left">Utilization</th>
              </tr>
            </thead>

            <tbody>
              {providers.map((provider) => {
                const percentage =
                  (provider.leadsCount / provider.monthlyQuota) * 100;

                const remaining =
                  provider.monthlyQuota - provider.leadsCount;

                return (
                  <tr
                    key={provider.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {provider.name}
                    </td>

                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {provider.leadsCount}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {remaining}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {percentage.toFixed(0)}% Used
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Recent Leads
        </h2>

        <div className="space-y-5">
          {providers
            .flatMap((p) =>
              (p.leadAssignments || []).map((a) => ({
                ...a.lead,
                providerName: p.name,
              }))
            )
            .filter(
              (lead, index, self) =>
                index === self.findIndex((l) => l.id === lead.id)
            )
            .map((lead) => (
              <div
                key={lead.id}
                className="border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {lead.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{lead.phone}</p>
                  </div>

                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold w-fit">
                    {lead.service?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium text-gray-800">{lead.city}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium text-gray-800">
                      {lead.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

    </main>
  );
}