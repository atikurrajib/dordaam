import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Award,
  CheckCircle2,
  FilePlus2,
  FileText,
  Gavel,
  Package,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function BuyerDashboard({ user }) {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [awardingBidId, setAwardingBidId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    category: "RMG & Textiles",
    specifications: "",
    quantity: "",
    unit: "pcs",
    target_price: "",
    deadline: "",
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchMyRfqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/rfqs/my`, authHeaders());
      setRfqs(res.data.rfqs || []);
    } catch (err) {
      console.error("Failed to fetch buyer RFQs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRfqs();
  }, [fetchMyRfqs]);

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });
    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/rfqs`,
        {
          ...formData,
          quantity: Number(formData.quantity),
          target_price: Number(formData.target_price),
        },
        authHeaders(),
      );
      setFeedback({
        type: "success",
        text: "RFQ published live! Verified sellers can now see and bid on it.",
      });
      setFormData({
        title: "",
        category: "RMG & Textiles",
        specifications: "",
        quantity: "",
        unit: "pcs",
        target_price: "",
        deadline: "",
      });
      setShowForm(false);
      fetchMyRfqs();
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err.response?.data?.error ||
          "Failed to publish RFQ. Make sure Admin has verified your account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (rfqId, bidId) => {
    setFeedback({ type: "", text: "" });
    try {
      setAwardingBidId(bidId);
      await axios.patch(
        `${API_URL}/rfqs/${rfqId}/award/${bidId}`,
        {},
        authHeaders(),
      );
      setFeedback({
        type: "success",
        text: "Quote accepted! Deal has been officially awarded to the supplier.",
      });
      fetchMyRfqs();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to award deal.",
      });
    } finally {
      setAwardingBidId(null);
    }
  };

  const openCount = rfqs.filter((r) => r.status === "open").length;
  const awardedCount = rfqs.filter((r) => r.status === "awarded").length;
  const totalBids = rfqs.reduce((acc, r) => acc + (r.bids?.length || 0), 0);

  return (
    <div className="space-y-6">
      {!user?.is_verified && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Account Verification Pending</p>
            <p className="mt-0.5 text-amber-800">
              Admin approval is required before you can publish live RFQs. Ask
              the Admin to click <strong>Approve &amp; Verify</strong> on your
              account, then re-login or refresh.
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
              Open RFQs
            </span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {openCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              Seller Quotes
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {totalBids}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-500">
              Deals Awarded
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {awardedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={fetchMyRfqs}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            {showForm ? "Close Form" : "Post New Bulk RFQ"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateRfq}
          className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4"
        >
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-gray-900">
              Publish Bulk Request for Quotation (RFQ)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set your target ceiling price — verified suppliers will compete
              with lower quotes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Product / Material Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 100% Combed Cotton Knit Fabric (180 GSM)"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Industry Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600 bg-white"
              >
                <option>RMG &amp; Textiles</option>
                <option>Packaging &amp; Cartons</option>
                <option>Construction &amp; Steel</option>
                <option>Agro &amp; Food Commodities</option>
                <option>Chemicals &amp; Polymers</option>
                <option>Electronics &amp; Electrical</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Required Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5000"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600"
                />
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="yards">yards</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Target Max Price (৳/unit) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="450"
                  value={formData.target_price}
                  onChange={(e) =>
                    setFormData({ ...formData, target_price: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Delivery Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">
                Technical Specifications &amp; Delivery Location
              </label>
              <textarea
                rows={2}
                placeholder="Specify GSM, color shade, packaging standard, and delivery factory address..."
                value={formData.specifications}
                onChange={(e) =>
                  setFormData({ ...formData, specifications: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Live RFQ"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-600" />
          Your Procurement Requests &amp; Incoming Quotes ({rfqs.length})
        </h3>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200/80 text-center text-xs text-gray-500">
            Loading your RFQs and incoming seller bids...
          </div>
        ) : rfqs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200/80 text-center">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-gray-900 mt-3">
              No bulk RFQs posted yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click <strong>Post New Bulk RFQ</strong> above to broadcast your
              first procurement request.
            </p>
          </div>
        ) : (
          rfqs.map((rfq) => {
            const bids = rfq.bids || [];
            const lowestPrice = bids[0]?.unit_price;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                        {rfq.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          rfq.status === "open"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rfq.status === "awarded"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {rfq.status}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Deadline: {rfq.deadline}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-gray-900 mt-1.5">
                      {rfq.title}
                    </h4>
                    {rfq.specifications && (
                      <p className="text-xs text-gray-500 mt-1">
                        {rfq.specifications}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-900">
                      {Number(rfq.quantity).toLocaleString()} {rfq.unit}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Ceiling: ৳{rfq.target_price}/{rfq.unit}
                    </p>
                    {lowestPrice && (
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5 inline-flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Best Bid: ৳
                        {lowestPrice}/{rfq.unit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-gray-50/40">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-rose-600" />
                    Supplier Quotes Received ({bids.length})
                  </p>

                  {bids.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Waiting for verified suppliers to submit reverse quotes...
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {bids.map((bid, idx) => {
                        const totalAmount = bid.unit_price * rfq.quantity;
                        const isWinner = rfq.awarded_bid_id === bid.id;

                        return (
                          <div
                            key={bid.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isWinner
                                ? "bg-emerald-50/70 border-emerald-300"
                                : "bg-white border-gray-200/80"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-900 text-xs">
                                  {bid.seller?.company_name ||
                                    bid.seller?.name ||
                                    `Supplier #${bid.seller_id}`}
                                </span>
                                {idx === 0 && rfq.status === "open" && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white">
                                    Lowest Quote
                                  </span>
                                )}
                                {isWinner && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                                    <Award className="w-3 h-3" /> Accepted
                                    Winner
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-gray-500 mt-1">
                                Delivery in{" "}
                                <strong className="text-gray-700">
                                  {bid.delivery_days} days
                                </strong>
                                {bid.note ? ` • "${bid.note}"` : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                              <div className="sm:text-right">
                                <p className="text-sm font-black text-gray-900">
                                  ৳{bid.unit_price}
                                  <span className="text-[11px] font-medium text-gray-500">
                                    /{rfq.unit}
                                  </span>
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Total: ৳{totalAmount.toLocaleString()}
                                </p>
                              </div>

                              {rfq.status === "open" ? (
                                <button
                                  disabled={awardingBidId === bid.id}
                                  onClick={() =>
                                    handleAcceptBid(rfq.id, bid.id)
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {awardingBidId === bid.id
                                    ? "Accepting..."
                                    : "Accept Deal"}
                                </button>
                              ) : isWinner ? (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Deal
                                  Locked
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-gray-400">
                                  Not Selected
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
