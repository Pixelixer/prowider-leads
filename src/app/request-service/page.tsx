"use client";

import { useState } from "react";

export default function RequestServicePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    description: "",
    serviceId: "1",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceId: Number(formData.serviceId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.error || "Request failed");
        return;
      }

      setMessage("Lead submitted successfully!");
      setFormData({ name: "", phone: "", city: "", description: "", serviceId: "1" });
    } catch {
      setIsError(true);
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-10 rounded-3xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl transition">

          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Request Service
          </h1>

          <p className="text-gray-500 mt-4">
            Smart lead allocation system with real-time provider distribution
          </p>

          <div className="mt-8 space-y-3 text-sm text-gray-600">

            <div className="flex items-center gap-2">
              <span className="text-black">✔</span> Instant validation
            </div>

            <div className="flex items-center gap-2">
              <span className="text-black">✔</span> Smart provider assignment
            </div>

            <div className="flex items-center gap-2">
              <span className="text-black">✔</span> Real-time updates (SSE)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-black">✔</span> Quota tracking system
            </div>

          </div>

          <div className="mt-10 text-xs text-gray-400">
            Low latency • Scalable architecture • Production ready flow
          </div>

        </div>

        {/* RIGHT FORM */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create Lead
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="1">Service 1</option>
              <option value="2">Service 2</option>
              <option value="3">Service 3</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe requirement..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 h-28 resize-none
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            {/* BUTTON (UPGRADED) */}
            <button
              disabled={loading}
              className="
                relative w-full overflow-hidden
                bg-black text-white font-semibold py-3 rounded-xl
                transition-all duration-300
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
                hover:-translate-y-0.5
                active:scale-[0.97]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition" />

              <span className="relative z-10">
                {loading ? "Processing..." : "Submit Lead"}
              </span>
            </button>

          </form>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mt-5 text-sm font-medium transition ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </div>
          )}

        </div>

      </div>

    </main>
  );
}