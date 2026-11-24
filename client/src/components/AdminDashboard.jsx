import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

// base url for the go backend, falls back to localhost if env var is missing
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function AdminDashboard() {
  // tracks which tab is currently visible, either business accounts or rfqs
  const [activeTab, setActiveTab] = useState("users");
  // list of all registered users fetched from the backend
  const [users, setUsers] = useState([]);
  // list of all rfqs fetched from the backend
  const [rfqs, setRfqs] = useState([]);
  // summary counters shown in the kpi cards
  const [stats, setStats] = useState({
    total_users: 0,
    pending_verifications: 0,
    total_rfqs: 0,
    total_bids: 0,
  });
  // currently selected role filter pill for the users table
  const [roleFilter, setRoleFilter] = useState("all");
  // free text search typed by the admin
  const [searchQuery, setSearchQuery] = useState("");
  // true while the overview data is being fetched
  const [loading, setLoading] = useState(true);
  // holds a user-facing error message when the api call fails
  const [errorMsg, setErrorMsg] = useState("");
  // id of the row currently running an action, used to disable its button
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // builds the auth header using the jwt stored in local storage
  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // loads users, rfqs and stats from the admin overview endpoint
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${API_URL}/admin/overview`, authHeaders());
      setUsers(res.data.users || []);
      setRfqs(res.data.rfqs || []);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
      // show a friendly message if the go backend is unreachable
      setErrorMsg(
        err.response?.data?.error ||
          "Could not reach Go backend (/api/admin/overview). Restart the Go server and click Refresh.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch the overview data once when the component mounts
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // flips a user's verified flag and keeps the pending counter in sync
  const handleToggleVerify = async (userId) => {
    try {
      setActionLoadingId(userId);
      const res = await axios.patch(
        `${API_URL}/admin/users/${userId}/verify`,
        {},
        authHeaders(),
      );
      const updatedUser = res.data.user;

      setUsers((prev) => {
        // swap in the updated user returned by the backend
        const next = prev.map((u) => (u.id === userId ? updatedUser : u));
        // recompute how many non-admin users still need verification
        const pendingCount = next.filter(
          (u) => !u.is_verified && u.role !== "admin",
        ).length;
        setStats((s) => ({ ...s, pending_verifications: pendingCount }));
        return next;
      });
    } catch (err) {
      console.error("Verification update failed:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // forcibly closes an rfq so it no longer accepts new bids
  const handleCloseRfq = async (rfqId) => {
    try {
      setActionLoadingId(rfqId);
      await axios.patch(
        `${API_URL}/admin/rfqs/${rfqId}/close`,
        {},
        authHeaders(),
      );
      // update the local list immediately instead of refetching everything
      setRfqs((prev) =>
        prev.map((r) => (r.id === rfqId ? { ...r, status: "closed" } : r)),
      );
    } catch (err) {
      console.error("Failed to close RFQ:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // applies the role pill filter and the search box to the users list
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "pending"
          ? !u.is_verified && u.role !== "admin"
          : u.role === roleFilter;

    const q = searchQuery.toLowerCase();
    // match on name, email or company name, whichever is available
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  // applies the search box to the rfqs list, matching by title only
  const filteredRfqs = rfqs.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // builds a two-letter avatar badge from the first two words of a name
  const getInitials = (name = "B") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* crimson executive command header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-600 via-rose-600 to-rose-800 p-6 sm:p-7 text-white shadow-md shadow-rose-600/15">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 -bottom-16 h-40 w-40 rounded-full bg-rose-950/25 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" /> Executive Control Center
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2">
              Marketplace Governance &amp; KYB Verification
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl">
              Registered Bangladeshi buyers and suppliers, verify trade
              credibility, and oversee live bulk reverse-bidding activity.
            </p>
          </div>

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Syncing..." : "Sync Live Data"}
          </button>
        </div>
      </div>

      {/* backend connection warning banner if api fails */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={fetchOverview}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* elevated kpi cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* total registered businesses card */}
        <div className="group bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-rose-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
              Directory <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-4 tracking-tight">
            {stats.total_users}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Registered Businesses
          </p>
        </div>

        {/* pending kyb verification queue card */}
        <div className="group bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-amber-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Action Queue
            </span>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-4 tracking-tight">
            {stats.pending_verifications}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Pending KYB Reviews
          </p>
        </div>

        {/* total rfqs posted across the marketplace card */}
        <div className="group bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-rose-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
              Exchange <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-4 tracking-tight">
            {stats.total_rfqs}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Total Bulk RFQs Posted
          </p>
        </div>

        {/* total active bids on the live market card */}
        <div className="group bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-emerald-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Market
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-4 tracking-tight">
            {stats.total_bids}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            Active Reverse Quotes
          </p>
        </div>
      </div>

      {/* main admin workspace card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* top toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* segmented navigation tabs */}
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200/70 self-start">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-2 cursor-pointer ${
                activeTab === "users"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Business Accounts
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeTab === "users"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rfqs")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-2 cursor-pointer ${
                activeTab === "rfqs"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              RFQ Exchange Monitor
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeTab === "rfqs"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {rfqs.length}
              </span>
            </button>
          </div>

          {/* filter pills & search input */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* role filter pills, only shown on the users tab */}
            {activeTab === "users" && (
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200/80">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "buyer", label: "Buyers" },
                  { key: "seller", label: "Sellers" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRoleFilter(f.key)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                      roleFilter === f.key
                        ? "bg-rose-600 text-white shadow-2xs"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* search box, placeholder text changes based on active tab */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "users"
                    ? "Search company, name, email..."
                    : "Search RFQ title..."
                }
                className="pl-9 pr-3.5 py-2 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/10 w-60 transition"
              />
            </div>
          </div>
        </div>

        {loading ? (
          // spinner shown while the overview request is in flight
          <div className="p-16 text-center">
            <div className="w-9 h-9 rounded-full border-2 border-rose-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-medium text-gray-500 mt-3">
              Fetching live Supabase records...
            </p>
          </div>
        ) : activeTab === "users" ? (
          // business accounts table, lists every registered user
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Business Entity &amp; Contact</th>
                  <th className="py-3.5 px-4">Account Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">KYB Status</th>
                  <th className="py-3.5 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-rose-50/25 transition-colors"
                  >
                    <td className="py-4 px-6">
                      {/* avatar badge plus company name, contact name and email */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(u.company_name || u.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[13px]">
                            {u.company_name || "Independent Business"}
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            {u.name} •{" "}
                            <span className="text-gray-400">{u.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {/* role badge, colored differently for admin, seller and buyer */}
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                          u.role === "admin"
                            ? "bg-gray-900 text-white"
                            : u.role === "seller"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-600">
                      {u.phone || "—"}
                    </td>
                    <td className="py-4 px-4">
                      {/* kyb verification status, verified vs still pending */}
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* admins cannot be verified or revoked, only buyers and sellers can */}
                      {u.role === "admin" ? (
                        <span className="text-[11px] font-semibold text-gray-400">
                          System Owner
                        </span>
                      ) : (
                        <button
                          disabled={actionLoadingId === u.id}
                          onClick={() => handleToggleVerify(u.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                            u.is_verified
                              ? "bg-white border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-700 hover:text-rose-600"
                              : "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                          }`}
                        >
                          {actionLoadingId === u.id
                            ? "Updating..."
                            : u.is_verified
                              ? "Revoke Badge"
                              : "Approve & Verify"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* shown when no user matches the current filter or search */}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-14 px-6 text-center">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-gray-800 mt-3">
                        No matching business accounts
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Try clearing your search filter or register a Buyer /
                        Seller account to review them here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // rfq exchange monitor table, lists every rfq posted by buyers
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">RFQ Title &amp; Category</th>
                  <th className="py-3.5 px-4">Buyer Company</th>
                  <th className="py-3.5 px-4">Volume &amp; Ceiling</th>
                  <th className="py-3.5 px-4">Quotes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRfqs.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-rose-50/25 transition-colors"
                  >
                    <td className="py-4 px-6">
                      {/* rfq title plus id, category and deadline metadata */}
                      <p className="font-bold text-gray-900 text-[13px]">
                        {r.title}
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        RFQ #{r.id} • {r.category} • Deadline: {r.deadline}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {/* buyer company name, falls back to buyer id if missing */}
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-rose-600" />
                        {r.buyer?.company_name ||
                          r.buyer?.name ||
                          `Buyer #${r.buyer_id}`}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {/* requested quantity and the buyer's max price ceiling */}
                      <span className="font-bold text-gray-900">
                        {Number(r.quantity).toLocaleString()} {r.unit}
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        Max: ৳{r.target_price}/{r.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {/* number of bids submitted so far for this rfq */}
                      <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px]">
                        {r.bids?.length || 0} bids
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {/* rfq status badge, colored by open, awarded or other */}
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          r.status === "open"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "awarded"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* only open rfqs can be force closed by an admin */}
                      {r.status === "open" && (
                        <button
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleCloseRfq(r.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Force Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* shown when no rfq matches the current search */}
                {filteredRfqs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-14 px-6 text-center">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-gray-800 mt-3">
                        No RFQs on the exchange yet
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Once buyers post bulk procurement requests, they will
                        appear here in real time.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
