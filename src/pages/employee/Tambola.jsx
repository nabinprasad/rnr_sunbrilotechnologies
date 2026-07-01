import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import socket from "../../socket";
import { getEmployee } from "../../utils/employeeStorage";
import {
  getTambolaSession,
  getTambolaTicket,
  submitTambolaClaim,
} from "../../api/tambolaApi";
import TambolaTicket, { CLAIM_OPTIONS } from "../../components/tambola/TambolaTicket";

export default function EmployeeTambola() {
  const employee = getEmployee();
  const [session, setSession] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [myClaims, setMyClaims] = useState([]);

  useEffect(() => {
    loadData();

    const handleSession = (updatedSession) => {
      setSession(updatedSession);
    };

    socket.on("tambolaSessionUpdated", handleSession);

    const interval = setInterval(loadData, 3000);

    return () => {
      clearInterval(interval);
      socket.off("tambolaSessionUpdated", handleSession);
    };
  }, []);

  const loadData = async () => {
    try {
      const sessionRes = await getTambolaSession();
      setSession(sessionRes.data.session);

      if (employee?._id) {
        try {
          const ticketRes = await getTambolaTicket(employee._id);
          setTicket(ticketRes.data.ticket);
        } catch {
          setTicket(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClaim = async (claimType) => {
    if (!employee?._id) {
      toast.error("Employee session not found");
      return;
    }

    try {
      setClaiming(claimType);
      await submitTambolaClaim({
        employeeId: employee._id,
        employeeName: employee.name,
        claimType,
      });
      setMyClaims((prev) => [...prev, claimType]);
      toast.success("Claim submitted! Waiting for host approval.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to submit claim");
    } finally {
      setClaiming(null);
    }
  };

  const isClaimDisabled = (claimType) => {
    if (session?.status !== "Live") return true;
    if (session?.winners?.[claimType]) return true;
    if (myClaims.includes(claimType)) return true;
    return claiming !== null;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-purple-700 text-white py-5 px-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tambola</h1>
          <p>{employee?.name}</p>
        </div>

        <div className="text-right">
          <p className="text-sm opacity-80">Status: {session?.status || "Waiting"}</p>
          {session?.currentNumber && (
            <p className="text-3xl font-bold">#{session.currentNumber}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        {session?.status === "Waiting" && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Waiting for Host</h2>
            <p className="text-gray-500">
              The tambola game has not started yet. Please wait for the host to begin.
            </p>
            <Link
              to="/employee/lobby"
              className="inline-block mt-6 text-purple-700 hover:underline"
            >
              Back to Lobby
            </Link>
          </div>
        )}

        {session?.status === "Finished" && (
          <div className="bg-white rounded-xl shadow p-8 text-center mb-8">
            <h2 className="text-2xl font-bold mb-3">Game Finished</h2>
            <p className="text-gray-500">Thanks for playing!</p>
          </div>
        )}

        {session?.status === "Live" && !ticket && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">No Ticket Yet</h2>
            <p className="text-gray-500">
              Your ticket will appear once the host starts the game.
            </p>
          </div>
        )}

        {ticket && (
          <>
            <div className="bg-white rounded-xl shadow p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Ticket</h2>
              <TambolaTicket
                grid={ticket.grid}
                calledNumbers={session?.calledNumbers || []}
              />
            </div>

            {session?.calledNumbers?.length > 0 && (
              <div className="bg-white rounded-xl shadow p-8 mb-8">
                <h2 className="text-xl font-bold mb-4">Called Numbers</h2>
                <div className="flex flex-wrap gap-2">
                  {session.calledNumbers.map((num) => (
                    <span
                      key={num}
                      className={`px-3 py-1 rounded-lg font-semibold text-sm ${
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

            {session?.status === "Live" && (
              <div className="bg-white rounded-xl shadow p-8">
                <h2 className="text-xl font-bold mb-4">Claim a Prize</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {CLAIM_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleClaim(option.id)}
                      disabled={isClaimDisabled(option.id)}
                      className="border-2 border-purple-300 rounded-xl p-4 font-semibold hover:bg-purple-600 hover:text-white hover:border-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {option.label}
                      {session?.winners?.[option.id] && (
                        <span className="block text-xs mt-1 font-normal">
                          Won by {session.winners[option.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link to="/employee/lobby" className="text-purple-700 hover:underline">
            Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}
