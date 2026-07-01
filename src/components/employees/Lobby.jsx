import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaPoll,
  FaGift,
  FaTrophy,
  FaDice,
} from "react-icons/fa";
import { getEvent } from "../../api/eventApi";

export default function Lobby() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  const [event, setEvent] = useState(null);

  useEffect(() => {
    loadEvent();

    const interval = setInterval(() => {
      loadEvent();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadEvent = async () => {
    try {
      const res = await getEvent();
      setEvent(res.data.event);
    } catch (err) {
      console.log(err);
    }
  };

  const renderButton = () => {
    if (!event) return null;

    switch (event.currentActivity) {
      case "Quiz":
        return (
          <Link
            to="/employee/live-quiz"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
          >
            Join Quiz
          </Link>
        );

      case "Poll":
        return (
          <Link
            to="/employee/poll"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
          >
            Join Poll
          </Link>
        );

      case "Tambola":
        return (
          <Link
            to="/employee/tambola"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg"
          >
            Join Tambola
          </Link>
        );

      default:
        return (
          <div className="text-gray-500">
            Waiting for the host to start an activity...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-blue-700 text-white py-5 px-10 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reward & Recognition Event</h1>

          <p>{employee.name}</p>
        </div>

        <div className="text-right">
          <p>{employee.department}</p>

          <h2 className="text-xl">{event?.status || "Waiting"}</h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h2 className="text-3xl font-bold">Current Activity</h2>
          {event?.hostMessage && (
            <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-5">
              <h3 className="font-bold">📢 Host Announcement</h3>

              <p className="mt-2">{event.hostMessage}</p>
            </div>
          )}

          <p className="text-gray-500 mt-3">
            {event?.currentActivity || "Waiting"}
          </p>

          <div className="mt-8">{renderButton()}</div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaQuestionCircle className="mx-auto text-5xl text-blue-600" />

            <h3 className="mt-4 font-semibold">Quiz</h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaPoll className="mx-auto text-5xl text-green-600" />

            <h3 className="mt-4 font-semibold">Poll</h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaDice className="mx-auto text-5xl text-purple-600" />

            <h3 className="mt-4 font-semibold">Tambola</h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaGift className="mx-auto text-5xl text-orange-600" />

            <h3 className="mt-4 font-semibold">Lucky Draw</h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <FaTrophy className="mx-auto text-5xl text-yellow-500" />

            <h3 className="mt-4 font-semibold">Leaderboard</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
