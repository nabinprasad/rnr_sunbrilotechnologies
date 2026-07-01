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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 text-white py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-400 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
            {event.title || "Reward & Recognition"}
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-blue-100">
            {event.subtitle || "Celebrating excellence together"}
          </p>

          <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-white/20 backdrop-blur-md px-6 py-2 border border-white/30">
            <span className="inline-block h-3 w-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-base font-semibold text-white">
              {event.status || "Upcoming"}
            </span>
          </div>
        </div>
      </div>

      {/* Event Countdown */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-20 lg:px-8">
        <div className="rounded-2xl bg-white shadow-2xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-slate-900">
            Event Countdown
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {["days", "hours", "minutes", "seconds"].map((item) => (
              <div
                key={item}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition"
              >
                <p className="text-4xl sm:text-5xl font-black text-blue-600">
                  {timeLeft[item] || 0}
                </p>
                <p className="uppercase mt-3 font-semibold text-sm sm:text-base text-slate-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white shadow-xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Event Details
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Venue
                  </p>
                  <p className="mt-1 text-lg text-slate-900 font-semibold">
                    {event.venue || "To be decided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Date & Time
                  </p>
                  <p className="mt-1 text-lg text-slate-900 font-semibold">
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleString()
                      : "To be decided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Current Activity
                  </p>
                  <p className="mt-1 text-lg text-slate-900 font-semibold">
                    {event.currentActivity || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-amber-600 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Announcement
              </h2>
            </div>

            <div className="bg-white/70 rounded-xl p-6 border border-amber-200">
              <p className="text-lg text-slate-700 leading-relaxed">
                {event.announcement || "Stay tuned for exciting updates and announcements!"}
              </p>
            </div>

            <div className="mt-6 p-6 bg-white/50 rounded-xl border border-amber-200">
              <p className="text-sm text-slate-600">
                <strong>Welcome Message:</strong> {event.welcomeMessage || "Welcome to the event!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Activities & Features
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Explore the exciting activities happening at the event
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { icon: "🧠", name: "Quiz", enabled: event.quizEnabled },
            { icon: "📊", name: "Poll", enabled: event.pollEnabled },
            { icon: "🎲", name: "Tambola", enabled: event.tambolaEnabled },
            { icon: "🎯", name: "Memory", enabled: event.memoryEnabled },
            { icon: "🎁", name: "Lucky Draw", enabled: event.luckyDrawEnabled },
          ].map((activity) => (
            <div
              key={activity.name}
              className={`rounded-2xl p-6 sm:p-8 text-center transition-all transform hover:scale-105 shadow-lg ${
                activity.enabled
                  ? "bg-white hover:shadow-xl"
                  : "bg-slate-100 opacity-50"
              }`}
            >
              <p className="text-4xl sm:text-5xl mb-3">{activity.icon}</p>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {activity.name}
              </h3>
              {activity.enabled && (
                <p className="mt-2 text-xs font-semibold text-green-600 uppercase">
                  Enabled
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Event Schedule
          </h2>
        </div>

        <div className="rounded-2xl bg-white shadow-xl p-8 sm:p-10 overflow-x-auto">
          <div className="space-y-4">
            {[
              { time: "09:30 AM", activity: "Registration & Check-in" },
              { time: "10:00 AM", activity: "Welcome Speech & Keynote" },
              { time: "11:00 AM", activity: "Quiz Competition" },
              { time: "01:00 PM", activity: "Lunch Break" },
              { time: "02:00 PM", activity: "Games & Interactive Activities" },
              { time: "04:00 PM", activity: "Awards Ceremony" },
            ].map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center gap-6 pb-4 border-b border-slate-200 last:border-0 hover:bg-slate-50 px-4 py-3 rounded-lg transition"
              >
                <div className="flex-shrink-0 w-24 sm:w-32">
                  <p className="font-bold text-blue-600 text-lg">{slot.time}</p>
                </div>
                <div className="flex-grow h-px bg-slate-300" />
                <div className="flex-grow">
                  <p className="font-semibold text-slate-900 text-base sm:text-lg">
                    {slot.activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Get Ready for an Unforgettable Experience
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Join us and be part of something extraordinary
          </p>
        </div>
      </div>
    </div>
  );
}
