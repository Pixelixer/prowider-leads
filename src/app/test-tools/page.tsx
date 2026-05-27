"use client";

import { useState, useEffect } from "react";

export default function TestToolsPage() {
  const [webhookEventId, setWebhookEventId] = useState("");
  const [webhookStatus, setWebhookStatus] = useState<string[]>([]);
  const [concurrencyStatus, setConcurrencyStatus] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setWebhookEventId(crypto.randomUUID());
  }, []);

  const triggerWebhook = async (times: number) => {
    setLoading("webhook");
    setWebhookStatus([]);

    const results: string[] = [];

    for (let i = 0; i < times; i++) {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: webhookEventId }),
      });

      const data = await res.json();
      results.push(data.message || data.error);
    }

    setWebhookStatus(results);
    setLoading(null);
  };

  const generateLeads = async () => {
    setLoading("leads");
    setConcurrencyStatus("Processing concurrent requests...");

    const services = [1, 2, 3];
    const timestamp = Date.now();

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `Test User ${i + 1}`,
            phone: `9${String(timestamp).slice(-8)}${i}`,
            city: "Test City",
            serviceId: services[i % 3],
            description: `Concurrent test lead ${i + 1}`,
          }),
        }).then((r) => r.json())
      )
    );

    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    setConcurrencyStatus(`Success: ${success} | Failed: ${failed}`);
    setLoading(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">

      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-800">
            Test Tools
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            System testing utilities
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* WEBHOOK CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-6
            transition hover:shadow-2xl hover:-translate-y-1">

            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Webhook Simulation
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Simulates webhook idempotency behavior
            </p>

            <button
              onClick={() => triggerWebhook(1)}
              disabled={loading === "webhook"}
              className="w-full bg-black text-white py-3 rounded-xl
                transition hover:opacity-90 hover:scale-[1.01]
                active:scale-[0.98]
                disabled:opacity-50"
            >
              {loading === "webhook" ? "Processing..." : "Reset Quota"}
            </button>

            <button
              onClick={() => triggerWebhook(5)}
              disabled={loading === "webhook"}
              className="w-full mt-3 border border-gray-300 py-3 rounded-xl
                transition hover:bg-gray-50 hover:scale-[1.01]
                active:scale-[0.98]
                disabled:opacity-50"
            >
              Multiple Calls
            </button>

            {webhookStatus.length > 0 && (
              <div className="mt-5 space-y-2">
                {webhookStatus.map((s, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    {s}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* CONCURRENCY CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-6
            transition hover:shadow-2xl hover:-translate-y-1">

            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Concurrency Test
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Generates multiple leads simultaneously
            </p>

            <button
              onClick={generateLeads}
              disabled={loading === "leads"}
              className="w-full bg-black text-white py-3 rounded-xl
                transition hover:opacity-90 hover:scale-[1.01]
                active:scale-[0.98]
                disabled:opacity-50"
            >
              {loading === "leads" ? "Processing..." : "Generate Leads"}
            </button>

            {concurrencyStatus && (
              <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  {concurrencyStatus}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </main>
  );
}