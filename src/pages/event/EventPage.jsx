import { useEffect, useState } from "react";
import { getEvent } from "../../api/eventApi";

export default function EventPage() {
  const [event, setEvent] = useState({});
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    fetchEvent();
  }, []);

  useEffect(() => {
    if (!event.eventDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(event.eventDate).getTime();

      const difference = target - now;

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (difference % (1000 * 60 * 60)) /
            (1000 * 60)
        ),
        seconds: Math.floor(
          (difference % (1000 * 60)) / 1000
        ),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent();
      setEvent(res.data.event);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">

      {/* Hero */}

      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-16">

        <div className="max-w-7xl mx-auto text-center">

          <h1 className="text-5xl font-bold">
            {event.title}
          </h1>

          <p className="mt-4 text-2xl">
            {event.subtitle}
          </p>

          <div className="mt-8 inline-block px-6 py-2 rounded-full bg-white text-blue-700 font-semibold">
            {event.status}
          </div>

        </div>

      </div>

      {/* Countdown */}

      <div className="max-w-6xl mx-auto mt-12">

        <h2 className="text-3xl font-bold text-center mb-8">
          Event Countdown
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {["days","hours","minutes","seconds"].map((item)=>(
            <div
              key={item}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >

              <h1 className="text-5xl font-bold text-blue-600">
                {timeLeft[item] || 0}
              </h1>

              <p className="uppercase mt-3 font-semibold">
                {item}
              </p>

            </div>
          ))}

        </div>

      </div>

      {/* Details */}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mt-12">

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-2xl font-bold mb-5">
            Event Details
          </h2>

          <p className="mb-3">
            📍 <strong>Venue:</strong> {event.venue}
          </p>

          <p>
            📅{" "}
            <strong>Date:</strong>{" "}
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : ""}
          </p>

        </div>

        <div className="bg-yellow-100 rounded-xl shadow p-8">

          <h2 className="text-2xl font-bold mb-5">
            Announcement
          </h2>

          <p className="text-lg">
            {event.announcement || "No announcements"}
          </p>

        </div>

      </div>

      {/* Activities */}

      <div className="max-w-6xl mx-auto mt-14">

        <h2 className="text-3xl font-bold text-center mb-10">
          Activities
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">

          {[
            "🧠 Quiz",
            "📊 Poll",
            "🎲 Tambola",
            "🎯 Memory",
            "🎁 Lucky Draw",
          ].map((activity) => (

            <div
              key={activity}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition"
            >

              <h3 className="font-bold text-lg">
                {activity}
              </h3>

            </div>

          ))}

        </div>

      </div>

      {/* Schedule */}

      <div className="max-w-6xl mx-auto mt-14 mb-20">

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-3xl font-bold mb-6">
            Today's Schedule
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between">
              <span>09:30 AM</span>
              <span>Registration</span>
            </div>

            <div className="flex justify-between">
              <span>10:00 AM</span>
              <span>Welcome Speech</span>
            </div>

            <div className="flex justify-between">
              <span>11:00 AM</span>
              <span>Quiz Competition</span>
            </div>

            <div className="flex justify-between">
              <span>01:00 PM</span>
              <span>Lunch Break</span>
            </div>

            <div className="flex justify-between">
              <span>02:00 PM</span>
              <span>Games</span>
            </div>

            <div className="flex justify-between">
              <span>04:00 PM</span>
              <span>Awards Ceremony</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}