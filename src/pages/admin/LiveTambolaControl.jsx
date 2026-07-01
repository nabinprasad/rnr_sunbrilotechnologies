import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import toast from "react-hot-toast";
import socket from "../../socket";
import {
  getTambolaSession,
  startTambolaSession,
  callTambolaNumber,
  endTambolaSession,
  resetTambolaSession,
  getTambolaClaims,
  reviewTambolaClaim,
} from "../../api/tambolaApi";

const CLAIM_LABELS = {
  earlyFive: "Early Five",
  topLine: "Top Line",
  middleLine: "Middle Line",
  bottomLine: "Bottom Line",
  fullHouse: "Full House",
};

export default function LiveTambolaControl() {
  const [session, setSession] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();

    const handleSession = (updatedSession) => {
      setSession(updatedSession);
    };

    const handleClaim = () => {
      loadClaims();
    };

    socket.on("tambolaSessionUpdated", handleSession);
    socket.on("tambolaClaimUpdated", handleClaim);

    const interval = setInterval(loadData, 3000);

    return () => {
      clearInterval(interval);
      socket.off("tambolaSessionUpdated", handleSession);
      socket.off("tambolaClaimUpdated", handleClaim);
    };
  }, []);

  const loadSession = async () => {
    const res = await getTambolaSession();
    setSession(res.data.session);
  };

  const loadClaims = async () => {
    const res = await getTambolaClaims();
    setClaims(res.data.claims);
  };

  const loadData = async () => {
    try {
      await Promise.all([loadSession(), loadClaims()]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await startTambolaSession();
      setSession(res.data.session);
      toast.success(`Tambola started! ${res.data.ticketsGenerated} tickets generated`);
      loadClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start tambola");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNumber = async () => {
    try {
      setLoading(true);
      const res = await callTambolaNumber();
      setSession(res.data.session);

      if (res.data.number) {
        toast.success(`Number called: ${res.data.number}`);
      } else {
        toast.success(res.data.message || "All numbers called");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to call number");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    try {
      await endTambolaSession();
      await loadSession();
      toast.success("Tambola ended");
    } catch (err) {
      toast.error("Unable to end tambola");
    }
  };

  const handleReset = async () => {
    try {
      await resetTambolaSession();
      await loadData();
      toast.success("Tambola reset");
    } catch (err) {
      toast.error("Unable to reset tambola");
    }
  };

  const handleReview = async (claimId, action) => {
    try {
      const res = await reviewTambolaClaim(claimId, action);
      setSession(res.data.session);
      loadClaims();
      toast.success(action === "approve" ? "Claim approved" : "Claim rejected");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to review claim");
    }
  };

  const pendingClaims = claims.filter((claim) => claim.status === "Pending");
  const calledCount = session?.calledNumbers?.length || 0;

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Live Tambola Control</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-purple-600 text-white rounded-xl p-6">
            <p>Status</p>
            <h2 className="text-2xl font-bold mt-2">{session?.status || "Waiting"}</h2>
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p>Numbers Called</p>
            <h2 className="text-2xl font-bold mt-2">{calledCount} / 90</h2>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-6">
            <p>Current Number</p>
            <h2 className="text-4xl font-bold mt-2">
              {session?.currentNumber ?? "-"}
            </h2>
          </div>

          <div className="bg-orange-600 text-white rounded-xl p-6">
            <p>Pending Claims</p>
            <h2 className="text-2xl font-bold mt-2">{pendingClaims.length}</h2>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg"
          >
            Start Tambola
          </button>

          <button
            onClick={handleCallNumber}
            disabled={loading || session?.status !== "Live"}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg"
          >
            Call Next Number
          </button>

          <button
            onClick={handleEnd}
            disabled={session?.status !== "Live"}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg"
          >
            End Game
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg"
          >
            Reset
          </button>
        </div>

        {session?.calledNumbers?.length > 0 && (
          <div className="mt-10 border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Called Numbers</h2>
            <div className="flex flex-wrap gap-2">
              {session.calledNumbers.map((num) => (
                <span
                  key={num}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${
                    num === session.currentNumber
                      ? "bg-green-600 text-white"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Winners</h2>
            <div className="space-y-3">
              {Object.entries(CLAIM_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="font-semibold">{label}</span>
                  <span className="text-purple-700 font-bold">
                    {session?.winners?.[key] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Pending Claims</h2>

            {pendingClaims.length === 0 ? (
              <p className="text-gray-500">No pending claims</p>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="border rounded-lg p-4 bg-yellow-50"
                  >
                    <p className="font-bold">{claim.employeeName}</p>
                    <p className="text-purple-700">
                      {CLAIM_LABELS[claim.claimType]}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReview(claim._id, "approve")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(claim._id, "reject")}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
