import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">

      <div className="max-w-4xl w-full">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gray-200 bg-white shadow-sm text-sm text-gray-600 mb-6">
            ⚡ Real-time Lead System
          </div>

          <h1 className="text-6xl font-black tracking-tight text-gray-900">
            Prowider
          </h1>

          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Smart lead distribution with real-time allocation and provider tracking
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          <Link href="/request-service">
            <div className="
              group relative bg-white border border-gray-200 rounded-2xl p-7
              shadow-sm transition-all duration-300 cursor-pointer
              hover:-translate-y-3 hover:shadow-2xl hover:border-gray-300
            ">

              {/* glow */}
              <div className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-gray-100 to-white
                transition duration-300 rounded-2xl
              " />

              <div className="relative">
                <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110">
                  📝
                </div>

                <h2 className="text-xl font-bold text-gray-900 group-hover:text-black transition">
                  Request Service
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Create leads and trigger allocation engine
                </p>
              </div>

            </div>
          </Link>

          <Link href="/dashboard">
            <div className="
              group relative bg-white border border-gray-200 rounded-2xl p-7
              shadow-sm transition-all duration-300 cursor-pointer
              hover:-translate-y-3 hover:shadow-2xl hover:border-gray-300
            ">

              <div className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-gray-100 to-white
                transition duration-300 rounded-2xl
              " />

              <div className="relative">
                <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110">
                  📊
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Monitor real-time provider performance
                </p>
              </div>

            </div>
          </Link>

          <Link href="/test-tools">
            <div className="
              group relative bg-white border border-gray-200 rounded-2xl p-7
              shadow-sm transition-all duration-300 cursor-pointer
              hover:-translate-y-3 hover:shadow-2xl hover:border-gray-300
            ">

              <div className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-gray-100 to-white
                transition duration-300 rounded-2xl
              " />

              <div className="relative">
                <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110">
                  ⚙️
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Test Tools
                </h2>

                <p className="text-gray-500 mt-2 text-sm">
                  Simulate webhook + concurrency load
                </p>
              </div>

            </div>
          </Link>

        </div>

      </div>

    </main>
  );
}