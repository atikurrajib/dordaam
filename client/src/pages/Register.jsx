import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  TrendingDown,
  User,
} from "lucide-react";
import logo from "../assets/images/logo.svg";

// registration page component for onboarding new buyers and sellers
export default function Register() {
  // form state holding user registration details and default buyer role
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    company_name: "",
    phone: "",
  });
  // toggle state for password field visibility
  const [showPassword, setShowPassword] = useState(false);
  // error message state for failed registration attempts
  const [error, setError] = useState("");
  // submission state to prevent duplicate api requests
  const [submitting, setSubmitting] = useState(false);

  // retrieve register action from auth context and router navigation hook
  const { register } = useAuth();
  const navigate = useNavigate();

  // update corresponding field in form state on user input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle registration form submission and redirect to dashboard on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // helper boolean to tailor ui copy based on selected account role
  const isBuyer = formData.role === "buyer";

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

            {/* navigation link back to landing page */}
            <Link
              to="/"
              className="text-xs font-semibold text-gray-600 hover:text-rose-600 transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          {/* dynamic role preview copy */}
          <div className="mt-12 lg:mt-16">
            {/* audience badge tailored to active role */}
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
              {isBuyer ? "FOR SHOPS & RETAILERS" : "FOR FACTORIES& WHOLESALERS"}
            </span>

            {/* role-specific headline */}
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {isBuyer ? (
                <>
                  Source Bulk Commodities at the
                  <span className="block text-rose-600 mt-1">
                    Lowest Live Bid
                  </span>
                </>
              ) : (
                <>
                  Win High-Volume B2B Orders
                  <span className="block text-rose-600 mt-1">
                    Without Middlemen
                  </span>
                </>
              )}
            </h1>

            {/* role-specific value proposition summary */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {isBuyer
                ? "Publish standardized bulk RFQs in 60 seconds and let verified suppliers across Bangladesh compete transparently for your order."
                : "Access ready-to-buy bulk procurement requests nationwide and submit competitive quotes in real time."}
            </p>

            {/* key platform benefits list */}
            <ul className="mt-8 space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {isBuyer
                    ? "Broadcast one RFQ to hundreds of vetted suppliers simultaneously"
                    : "Direct access to verified retail & corporate bulk demand"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {isBuyer
                    ? "Compare unit rates and delivery timelines side-by-side"
                    : "Real-time reverse auction updates with instant deal closure"}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  100% admin-verified business accounts for trusted trade
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom trust footer */}
        <div className="hidden lg:block pt-8 border-t border-rose-200/60 text-xs text-gray-500">
          Trusted by wholesale businesses across nationwide industrial hubs.
        </div>
      </div>

      {/* right registration form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
        <div className="w-full max-w-md">
          {/* form header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Join DORDAAM as a Buyer or Seller
            </p>
          </div>

          {/* role selector cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              {
                value: "buyer",
                label: "Buyer",
                sub: "Post RFQs & source bulk goods",
                icon: Building2,
              },
              {
                value: "seller",
                label: "Seller",
                sub: "Bid on orders & supply bulk",
                icon: TrendingDown,
              },
            ].map((item) => {
              const active = formData.role === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setFormData({ ...formData, role: item.value })}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                    active
                      ? "border-rose-600 bg-rose-50/60 ring-1 ring-rose-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <item.icon
                      className={`w-4 h-4 ${
                        active ? "text-rose-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? "bg-rose-600" : "bg-gray-200"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      active ? "text-rose-700" : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[11px] text-gray-500 leading-tight">
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* error alert banner */}
          {error && (
            <div className="mt-4 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* account registration form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* full name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Fazle Elahe"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. elahe@bengaltraders.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                />
              </div>
            </div>

            {/* company name & phone side-by-side */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* company name input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. Bengal Traders"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                  />
                </div>
              </div>

              {/* phone number input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXX-XXXXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
                  />
                </div>
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
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
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

            {/* submit registration button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {submitting
                ? "Creating account..."
                : `Register as ${isBuyer ? "Buyer" : "Seller"}`}{" "}
              {!submitting && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </form>

          {/* login redirect link */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-rose-600 font-semibold hover:text-rose-700 hover:underline transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
