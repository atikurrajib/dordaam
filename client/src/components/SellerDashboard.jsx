import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Gavel,
  PackageOpen,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function SellerDashboard({ user }) {
  const [openRfqs, setOpenRfqs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [bidRfqs, setBidRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBidRfqId, setActiveBidRfqId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [bidForm, setBidForm] = useState({
    unit_price: "",
    delivery_days: "",
    note: "",
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchMarketplace = useCallback(async () => {
    try {
      setLoading(true);
      const [rfqRes, bidRes] = await Promise.all([
        axios.get(`${API_URL}/rfqs/open`, authHeaders()),
        axios.get(`${API_URL}/bids/my`, authHeaders()),
      ]);
      setOpenRfqs(rfqRes.data.rfqs || []);
      setMyBids(bidRes.data.bids || []);
      setBidRfqs(bidRes.data.rfqs || []);
    } catch (err) {
      console.error("Failed to load seller exchange:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  const handleOpenBidBox = (rfq, existingBid) => {
    setActiveBidRfqId(rfq.id);
    setBidForm({
      unit_price: existingBid ? String(existingBid.unit_price) : "",
      delivery_days: existingBid ? String(existingBid.delivery_days) : "7",
      note: existingBid?.note || "",
    });
    setFeedback({ type: "", text: "" });
  };

  const handleSubmitBid = async (e, rfqId) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });
    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/rfqs/${rfqId}/bids`,
        {
          unit_price: Number(bidForm.unit_price),
          delivery_days: Number(bidForm.delivery_days),
          note: bidForm.note,
        },
        authHeaders(),
      );
      setFeedback({
        type: "success",
        text: "Your reverse quote has been submitted live to the buyer!",
      });
      setActiveBidRfqId(null);
      fetchMarketplace();
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err.response?.data?.error ||
          "Could not place bid. Ensure Admin has verified your seller account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const wonBidsCount = myBids.filter((b) => {
    const parentRfq = bidRfqs.find((r) => r.id === b.rfq_id);
    return parentRfq?.awarded_bid_id === b.id;
  }).length;

  return (
    <div className="space-y-6">
      {!user?.is_verified && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Supplier KYB Verification Pending</p>
            <p className="mt-0.5 text-amber-800">
              You can browse live buyer RFQs now, but Admin approval is required
              before submitting quotes.
            </p>
          </div>
        </div>
      )}

      {feedback.text && (
        <div
          className={`rounded-xl p-4 text-xs font-semibold border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback({ type: "", text: "" })}
            className="underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 flex-1">
          <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              New Live Requests
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {openRfqs.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              Quotes Submitted
            </span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {myBids.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              Deals Won
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {wonBidsCount}
            </p>
          </div>
        </div>

        <button
          onClick={fetchMarketplace}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-rose-600 text-xs font-bold shadow-2xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Requests
        </button>
      </div>

      {/* live new requests feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            New Buyer Requests on Live Exchange ({openRfqs.length})
          </h3>
          <span className="text-[11px] text-gray-400">
            Undercut the ceiling price to win orders
          </span>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200/80 text-center text-xs text-gray-500">
            Loading live buyer RFQs...
          </div>
        ) : openRfqs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200/80 text-center">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <PackageOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-3">
              No open buyer requests right now
            </p>
            <p className="text-xs text-gray-500 mt-1">
              When buyers post new bulk RFQs, they will immediately appear here.
            </p>
          </div>
        ) : (
          openRfqs.map((rfq) => {
            const existingBid = myBids.find((b) => b.rfq_id === rfq.id);
            const lowestBid = rfq.bids?.[0]?.unit_price;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-rose-200 shadow-2xs transition overflow-hidden"
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        New Request • Open
                      </span>
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700">
                        {rfq.category}
                      </span>
                      <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {rfq.buyer?.company_name || "Verified Buyer"}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-gray-900">
                      {rfq.title}
                    </h4>

                    {rfq.specifications && (
                      <p className="text-xs text-gray-500 max-w-2xl">
                        {rfq.specifications}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1 flex-wrap">
                      <span>
                        Volume:{" "}
                        <strong className="text-gray-800">
                          {Number(rfq.quantity).toLocaleString()} {rfq.unit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Deadline:{" "}
                        <strong className="text-gray-800">{rfq.deadline}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Competing Bids:{" "}
                        <strong className="text-rose-600">
                          {rfq.bids?.length || 0}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                    <div className="lg:text-right">
                      <span className="text-[11px] text-gray-400 block">
                        Buyer Ceiling Price
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        ৳{rfq.target_price}
                        <span className="text-xs font-medium text-gray-500">
                          /{rfq.unit}
                        </span>
                      </span>
                      {lowestBid && (
                        <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">
                          <TrendingDown className="w-3 h-3 inline mr-0.5" />
                          Current Lowest: ৳{lowestBid}/{rfq.unit}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {existingBid && (
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Quoted ৳{existingBid.unit_price}/{rfq.unit}
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenBidBox(rfq, existingBid)}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        {existingBid ? "Lower My Quote" : "Submit Reverse Bid"}
                      </button>
                    </div>
                  </div>
                </div>

                {activeBidRfqId === rfq.id && (
                  <form
                    onSubmit={(e) => handleSubmitBid(e, rfq.id)}
                    className="p-5 bg-rose-50/40 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs"
                  >
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Your Unit Price (৳/{rfq.unit}) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        max={rfq.target_price}
                        placeholder={`Max ৳${rfq.target_price}`}
                        value={bidForm.unit_price}
                        onChange={(e) =>
                          setBidForm({ ...bidForm, unit_price: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Delivery Lead Time (Days) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={bidForm.delivery_days}
                        onChange={(e) =>
                          setBidForm({
                            ...bidForm,
                            delivery_days: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Offer Terms / Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Ready stock, free transport"
                        value={bidForm.note}
                        onChange={(e) =>
                          setBidForm({ ...bidForm, note: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-rose-600"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submitting ? "Sending..." : "Send Quote"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveBidRfqId(null)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* seller's submitted bids & unlocked buyer contact after deal award */}
      {myBids.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="text-sm font-extrabold text-gray-900">
              Your Submitted Quotes &amp; Deal Status ({myBids.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {myBids.map((bid) => {
              const parentRfq = bidRfqs.find((r) => r.id === bid.rfq_id);
              const isWon = parentRfq?.awarded_bid_id === bid.id;
              const isClosed =
                parentRfq && parentRfq.status !== "open" && !isWon;

              return (
                <div
                  key={bid.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {parentRfq?.title || `RFQ #${bid.rfq_id}`} • Quoted ৳
                      {bid.unit_price}/unit
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      Delivery in {bid.delivery_days} days
                      {bid.note ? ` • ${bid.note}` : ""}
                    </p>

                    {isWon && parentRfq?.buyer && (
                      <div className="mt-2.5 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex-wrap">
                        <span className="font-semibold text-emerald-900">
                          Buyer:{" "}
                          {parentRfq.buyer.company_name || parentRfq.buyer.name}
                        </span>
                        {parentRfq.buyer.phone ? (
                          <a
                            href={`tel:${parentRfq.buyer.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                          >
                            <PhoneCall className="w-3 h-3" /> Call{" "}
                            {parentRfq.buyer.phone}
                          </a>
                        ) : (
                          <span className="text-emerald-700">
                            No phone provided
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {isWon ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        <Award className="w-3.5 h-3.5" /> Deal Won!
                      </span>
                    ) : isClosed ? (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">
                        Closed / Another Winner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Under Buyer Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}