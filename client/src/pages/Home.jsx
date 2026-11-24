import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Building2,
  TrendingDown,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";
import logo from "../assets/images/logo.svg";
import slideRfq from "../assets/images/slide-rfq.avif";
import slideBidding from "../assets/images/slide-bidding.avif";
import cardRfq from "../assets/images/card-rfq.avif";
import cardBidding from "../assets/images/card-bidding.avif";
import cardVerified from "../assets/images/card-verified.avif";
import cardSupply from "../assets/images/card-supply.avif";

// hero carousel slides data for showcasing core platform value propositions
const HERO_SLIDES = [
  {
    id: 1,
    tag: "B2B RFQ EXCHANGE",
    headline: "Source Bulk Commodities at the",
    highlight: "LOWEST LIVE BID",
    description:
      "Publish your Request for Quotation in 60 seconds and watch verified manufacturers & importers compete in real time.",
    image: slideRfq,
    imageAlt: "Wholesale warehouse supply chain",
    bgClass: "from-rose-50 via-amber-50/70 to-orange-50/80",
  },
  {
    id: 2,
    tag: "REAL-TIME BIDDING",
    headline: "Experience Faster Trade with",
    highlight: "INSTANT DEAL CLOSURE",
    description:
      "Compare unit prices, delivery timelines, and supplier ratings side-by-side without endless phone calls.",
    image: slideBidding,
    imageAlt: "Commercial freight and distribution",
    bgClass: "from-amber-50/80 via-rose-50/70 to-red-50",
  },
];

// feature vertical cards highlighting primary ecosystem capabilities
const VERTICAL_CARDS = [
  {
    icon: FileText,
    title: "Bulk RFQ",
    description:
      "B2B procurement system empowering businesses with structured bulk requests and faster restocking.",
    image: cardRfq,
  },
  {
    icon: Gavel,
    title: "Live Bidding",
    description:
      "Real-time reverse auction engine where verified sellers compete transparently to offer the best rate.",
    image: cardBidding,
  },
  {
    icon: ShieldCheck,
    title: "Verified Trade",
    description:
      "Admin-vetted factories, wholesalers, and corporate buyers unlocking trusted B2B commerce.",
    image: cardVerified,
  },
  {
    icon: Truck,
    title: "Smart Supply",
    description:
      "Partnering with leading suppliers to streamline and simplify bulk order fulfillment across Bangladesh.",
    image: cardSupply,
  },
];

// public landing page component showcasing platform workflow and business value
export default function Home() {
  // retrieve current authenticated user to toggle navigation ctas
  const { user } = useAuth();
  // active index state for hero banner carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  // auto-advance hero carousel slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // navigate to previous slide in carousel
  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  };

  // navigate to next slide in carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // active slide object derived from current index
  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans">
      {/* top navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* brand logo */}
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

          {/* center navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-700">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="transition hover:text-rose-600"
            >
              Home
            </Link>
            <a href="#about-us" className="hover:text-rose-600 transition">
              About Us
            </a>
            <a
              href="#how-dordaam-works"
              className="hover:text-rose-600 transition"
            >
              How DORDAAM Works
            </a>
            <a href="#for-business" className="hover:text-rose-600 transition">
              For Business
            </a>
          </nav>

          {/* right cta */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-md transition inline-flex items-center gap-1.5 shadow-xs"
              >
                Dashboard <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-md transition inline-flex items-center gap-1.5 shadow-xs"
              >
                Join Us <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* hero banner carousel */}
      <section className="pt-6 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bgClass} border border-gray-200/80 shadow-xs transition-all duration-500`}
          >
            <div className="grid md:grid-cols-12 items-center min-h-[340px] md:min-h-[380px]">
              {/* left product / supply visual */}
              <div className="md:col-span-5 h-56 md:h-full relative overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* right typography */}
              <div className="md:col-span-7 p-8 md:p-12 text-center md:text-left">
                <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full mb-3">
                  {slide.tag}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {slide.headline}
                  <span className="block text-rose-600 mt-1">
                    {slide.highlight}
                  </span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed">
                  {slide.description}
                </p>

                {/* primary and secondary hero cta buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-md transition inline-flex items-center gap-1.5 shadow-xs"
                  >
                    {user ? "Open Workspace" : "Start Trading Free"}{" "}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#how-dordaam-works"
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold rounded-md border border-gray-200 transition"
                  >
                    See Workflow
                  </a>
                </div>
              </div>
            </div>

            {/* subtle left/right carousel controls */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-700 items-center justify-center shadow-xs transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-700 items-center justify-center shadow-xs transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* pagination dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-5 bg-gray-900"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* mission heading + 4 vertical cards */}
      <section id="about-us" className="py-10 px-6 scroll-mt-18">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-rose-600 tracking-tight leading-snug">
            Building Bangladesh&apos;s Smarter B2B Procurement Ecosystem
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Powering how businesses buy, sell, request quotes, and negotiate in
            real time through an integrated wholesale marketplace built for
            emerging economies.
          </p>

          {/* 4 cards grid */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERTICAL_CARDS.map((card) => (
              <div
                key={card.title}
                className="group bg-white rounded-xl border border-gray-200/90 overflow-hidden flex flex-col items-center text-center shadow-2xs hover:shadow-lg hover:border-rose-200 transition-all duration-300"
              >
                {/* top thumbnail strip */}
                <div className="w-full h-28 overflow-hidden relative bg-rose-50">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>

                {/* floating icon badge */}
                <div className="-mt-8 relative z-10 w-14 h-14 rounded-2xl bg-white border border-rose-100 text-rose-600 flex items-center justify-center shadow-sm group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <card.icon className="w-7 h-7 stroke-[1.8]" />
                </div>

                {/* card body copy and details trigger */}
                <div className="p-6 pt-4 flex-1 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-gray-500 leading-relaxed flex-1">
                    {card.description}
                  </p>

                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className="mt-6 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition inline-flex items-center gap-1 shadow-2xs"
                  >
                    Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how dordaam works section */}
      <section
        id="how-dordaam-works"
        className="pt-14 pb-8 px-6 bg-white scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto">
          {/* section header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              How DORDAAM Works
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              From bulk requirement posting to real-time bidding and deal
              closure
            </p>
          </div>

          {/* 3-step workflow cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* step 01 card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-rose-200 transition">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Publish Bulk RFQ
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Verified Shops and Retailers list product specs, required
                quantities, target budget, and bidding deadline in a format.
              </p>
            </div>

            {/* step 02 card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-rose-200 transition">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Live Reverse Bidding
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Verified wholesalers and factories submit quotes and adjust
                prices dynamically via real-time updates.
              </p>
            </div>

            {/* step 03 card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-rose-200 transition">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Award &amp; Fulfill
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Compare bids transparently, award the winning supplier with one
                click, and complete direct fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* buyer & seller split cards */}
      <section
        id="for-business"
        className="pt-8 pb-16 px-6 bg-white scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto">
          {/* section header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              For Business
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Built for both bulk buyers and verified manufacturers across
              Bangladesh
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* buyer value proposition card */}
            <div className="bg-white p-7 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-rose-600 mb-2">
                  <Building2 className="w-4 h-4" /> For Shops &amp; Retailers
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Procure Faster at True Market Rates
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                    Broadcast one RFQ to hundreds of verified suppliers
                    simultaneously
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                    Track real-time lowest bids and delivery commitments
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 self-start px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition inline-flex items-center gap-1.5"
              >
                Register as Buyer <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* seller value proposition card */}
            <div className="bg-white p-7 rounded-xl border border-rose-200 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-rose-600 mb-2">
                  <TrendingDown className="w-4 h-4" /> For Factories &amp;
                  Wholesalers
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Win High-Volume B2B Orders Daily
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                    Access ready-to-buy bulk orders across Bangladesh
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                    Sell directly to buyers without middlemen cutting your
                    margins
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-6 self-start px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition inline-flex items-center gap-1.5"
              >
                Register as Seller <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* bottom crimson cta banner */}
      <section className="bg-rose-600 text-white py-10 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Grow Your Business with A Smart B2B Trading Marketplace!
            </h2>
            <p className="text-rose-100 text-sm mt-1">
              Join verified retailers and wholesalers trading smarter on
              DORDAAM.
            </p>
          </div>
          <Link
            to={user ? "/dashboard" : "/register"}
            className="px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 font-bold text-sm rounded-md transition inline-flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {user ? "Go to Dashboard" : "Join DORDAAM"}{" "}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* corporate footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 px-6 text-xs">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          {/* brand summary column */}
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              DORDAAM
            </span>
            <p className="mt-2 text-gray-400 leading-relaxed">
              Bangladesh&apos;s real-time B2B Request for Quotation (RFQ) and
              reverse-bidding platform connecting bulk buyers with verified
              suppliers.
            </p>
          </div>

          {/* quick navigation links column */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#about-us" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#how-dordaam-works"
                  className="hover:text-white transition"
                >
                  How Live Bidding Works
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Become a Verified Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* contact details column */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Dhaka,
                Bangladesh
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-500" />{" "}
                support@dordaam.com
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" /> +880
                1747-681997
              </li>
            </ul>
          </div>
        </div>

        {/* bottom copyright bar and social media links */}
        <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()} DORDAAM. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            {/* social media icons */}
            <div className="flex items-center gap-3.5 text-gray-400">
              <a
                href="https://www.youtube.com/@dordaam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="transition hover:text-white"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/dordaam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition hover:text-white"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@dordaam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="transition hover:text-white"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>

              <a
                href="https://discord.com/invite/dordaam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="transition hover:text-white"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>

            <span className="h-4 w-px bg-gray-700" />

            {/* auth links */}
            <Link to="/login" className="transition hover:text-white">
              Login
            </Link>
            <Link to="/register" className="transition hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}