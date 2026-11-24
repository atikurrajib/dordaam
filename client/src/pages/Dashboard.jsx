import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BuyerDashboard from "../components/BuyerDashboard";
import SellerDashboard from "../components/SellerDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { Building2, CheckCircle2, Clock, LogOut } from "lucide-react";
import logo from "../assets/images/logo.svg";

// main dashboard container routing users to their role-specific workspace
export default function Dashboard() {
  // retrieve authenticated user profile and logout handler
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-800 font-sans">
      {/* top navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200/80 px-6 h-20 flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          {/* left brand identity and active role badge */}
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* custom svg brand logo */}
              <img
                src={logo}
                alt="DORDAAM Logo"
                className="w-9 h-9 rounded-lg object-contain shadow-xs"
              />

              {/* stacked brand title and subtitle */}
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-xl tracking-tight text-rose-600">
                  DORDAAM
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
                  B2B RFQ EXCHANGE
                </span>
              </div>
            </Link>

            {/* vertical divider line */}
            <span className="h-5 w-px bg-gray-200 hidden sm:inline-block" />

            {/* active user role pill */}
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {user?.role || "Workspace"}
            </span>
          </div>

          {/* right user email display and logout trigger */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-medium text-gray-500">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="max-w-6xl mx-auto p-6 sm:py-8 space-y-6">
        {/* profile & verification summary banner */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* greeting header and kyb verification badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                Welcome, {user?.name}
              </h1>

              {/* render verified or pending status pill */}
              {user?.is_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3 h-3" /> Verification Pending
                </span>
              )}
            </div>

            {/* registered company name subtitle */}
            <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
                Company:{" "}
                <strong className="font-semibold text-gray-700">
                  {user?.company_name || "N/A"}
                </strong>
              </span>
            </div>
          </div>

          {/* navigation link back to public landing page */}
          <Link
            to="/"
            className="self-start sm:self-center text-xs font-semibold text-gray-600 hover:text-rose-600 transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* role-based workspace */}
        {user?.role === "buyer" && <BuyerDashboard user={user} />}
        {user?.role === "seller" && <SellerDashboard user={user} />}
        {user?.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}
