import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/images/logo.svg";

// login page component for authenticating existing buyers, sellers, and admins
export default function Login() {
  // form input states for user credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // toggle state for password field visibility
  const [showPassword, setShowPassword] = useState(false);
  // error message state for failed authentication attempts
  const [error, setError] = useState("");
  // submission state to prevent duplicate login requests
  const [submitting, setSubmitting] = useState(false);

  // retrieve login action from auth context and router navigation hook
  const { login } = useAuth();
  const navigate = useNavigate();

  // handle login form submission and redirect to dashboard on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col lg:flex-row font-sans">
      {/* left brand & value proposition panel */}
      <div className="lg:w-5/12 bg-gradient-to-br from-rose-50 via-amber-50/60 to-orange-50/70 border-b lg:border-b-0 lg:border-r border-gray-200/80 p-8 sm:p-12 flex flex-col justify-between">
        <div>
          {/* top logo + back link */}
          <div className="flex items-center justify-between">
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

            {/* navigation link back to public landing page */}
            <Link
              to="/"
              className="text-xs font-semibold text-gray-600 hover:text-rose-600 transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          {/* brand value copy */}
          <div className="mt-12 lg:mt-16">
            {/* audience badge */}
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
              FOR VERIFIED USERS
            </span>

            {/* welcome headline */}
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Welcome Back to <span className="text-rose-600">DORDAAM</span>
            </h1>

            {/* platform overview subtitle */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Login to manage your active RFQs, monitor live reverse bids, and
              close bulk orders directly with verified partners.
            </p>

            {/* key platform feature highlights */}
            <ul className="mt-8 space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Track live reverse auction quotes and lowest unit rates
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Compare supplier bids side-by-side and award orders in one
                  click
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Role-based workspace for Buyers, Sellers &amp; Admins
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom trust footer */}
        <div className="hidden lg:block pt-8 border-t border-rose-200/60 text-xs text-gray-500">
          Powering smarter bulk procurement across nationwide industrial hubs.
        </div>
      </div>

      {/* right sign-in form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
        <div className="w-full max-w-md">
          {/* form header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Login
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Login to your DORDAAM account
            </p>
          </div>

          {/* error alert banner */}
          {error && (
            <div className="mt-5 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* authentication form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                  placeholder="e.g. ador@biharitraders.com"
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                  placeholder="••••••••"
                />
                {/* password visibility toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* submit login button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {submitting ? "Logging..." : "Login"}{" "}
              {!submitting && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </form>

          {/* registration redirect link */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-rose-600 font-semibold hover:text-rose-700 hover:underline transition"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}