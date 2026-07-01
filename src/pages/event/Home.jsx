import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvent } from "../../api/eventApi";

export default function Home() {
  const [event, setEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEvent();
        setEvent(res.data.event);
      } catch (err) {
        console.log(err);
      }
    };

    fetchEvent();
  }, []);

  useEffect(() => {
    if (!event?.eventDate) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const target = new Date(event.eventDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 landing-page-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-15%] top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-blob" />
        <div className="absolute right-[-5%] top-20 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl animate-blob-slow" />
        <div className="absolute left-1/2 bottom-0 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl animate-blob" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-100/80 to-transparent" />

        <span className="absolute left-16 top-28 h-3 w-3 rounded-full bg-sky-400/50 blur-sm animate-float" />
        <span className="absolute left-32 top-72 h-4 w-4 rounded-full bg-rose-400/40 blur-sm animate-float-slow" />
        <span className="absolute right-24 top-32 h-2 w-2 rounded-full bg-emerald-400/40 blur-sm animate-float" />
        <span className="absolute right-16 bottom-28 h-3 w-3 rounded-full bg-indigo-400/40 blur-sm animate-float-slow" />
        <span className="absolute left-1/3 bottom-12 h-4 w-4 rounded-full bg-purple-400/30 blur-sm animate-float" />
      </div>

      <div className="relative z-10 mx-auto max-w-9xl px-6 py-10 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="space-y-10">
            <div className="flex flex-wrap items-center gap-4">
              <img src="/sunbrilologo.png" alt="Sunbrilo Logo" className="h-14 w-auto" />
              <img src="/riskonnectlogo.png" alt="Riskonnect Logo" className="h-14 w-auto" />
            </div>

            <div className="rounded-[2rem] bg-white/95 p-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.5)] backdrop-blur-sm sm:p-12">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">
                Reward & Recognition
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Celebrate achievements, strengthen culture, and inspire every team member.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                A polished employee engagement platform for event announcements, live quizzes, awards, certificates, and team recognition.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Link
                  to="/event"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200/40 transition hover:bg-blue-500"
                  target="_blank"
                >
                  View Event Details
                </Link>

                <Link
                  to="/employee/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
                  target="_blank"
                >
                  Employee Login
                </Link>

                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-50 px-8 py-4 text-base font-semibold text-blue-700 transition hover:bg-blue-100"
                  target="_blank"
                >
                  Admin Login
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Active Programs", value: event?.activityCount || 12 },
                  { label: "Total Rewards", value: event?.rewardCount || 38 },
                  { label: "Live Activities", value: event?.liveActivities || 7 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
                    <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="grid gap-6">
                <div className="rounded-[1.75rem] bg-slate-100 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Current Event</p>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-950">{event?.title || "Reward & Recognition 2026"}</h2>
                  <p className="mt-3 text-slate-600">{event?.subtitle || "Celebrating excellence together"}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{event?.status || "Upcoming"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Venue</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{event?.venue || "TBD"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Date & Time</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{event?.eventDate ? new Date(event.eventDate).toLocaleString() : "To be decided"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Current Activity</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{event?.currentActivity || "-"}</p>
                  </div>
                </div>

                {event?.eventDate && (
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <p className="text-sm text-slate-500">Countdown to Event</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-4">
                      {[
                        { label: "Days", value: timeLeft.days ?? 0 },
                        { label: "Hours", value: timeLeft.hours ?? 0 },
                        { label: "Minutes", value: timeLeft.minutes ?? 0 },
                        { label: "Seconds", value: timeLeft.seconds ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-3xl bg-white p-4 text-center shadow-sm">
                          <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Quiz", value: "Live scoring & instant feedback" },
                { label: "Awards", value: "Certificates, badges & recognition" },
                { label: "Polls", value: "Collect employee voice instantly" },
                { label: "Gifts", value: "Exciting prizes for top teams" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white shadow-xl">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-300">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Live Quiz",
              description: "Engage employees with fast-paced quizzes and leaderboards.",
              color: "from-sky-500 to-blue-500",
            },
            {
              title: "Awards & Certificates",
              description: "Celebrate top performers with trophies, badges, and certificates.",
              color: "from-emerald-500 to-teal-500",
            },
            {
              title: "Team Activities",
              description: "Boost collaboration through interactive games and polls.",
              color: "from-purple-500 to-fuchsia-500",
            },
          ].map((card) => (
            <div key={card.title} className="group overflow-hidden rounded-[2rem] bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
              <div className={`bg-gradient-to-br ${card.color} p-8 text-white`}>
                <p className="text-sm uppercase tracking-[0.3em] opacity-90">{card.title}</p>
                <p className="mt-4 text-2xl font-semibold">{card.title}</p>
              </div>
              <div className="p-6">
                <p className="text-slate-600">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
