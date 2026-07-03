import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvent } from "../../api/eventApi";

const highlights = [
  { label: "Live Quiz", value: "Fast rounds, live scores" },
  { label: "Awards", value: "Winner reveal and certificates" },
  { label: "Polls", value: "Instant team feedback" },
  { label: "Activities", value: "Shared event moments" },
];

const stats = [
  { label: "Active Programs", key: "activityCount", fallback: 12 },
  { label: "Total Rewards", key: "rewardCount", fallback: 38 },
  { label: "Live Activities", key: "liveActivities", fallback: 7 },
];

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

  const countdown = [
    { label: "Days", value: timeLeft.days ?? 0 },
    { label: "Hours", value: timeLeft.hours ?? 0 },
    { label: "Minutes", value: timeLeft.minutes ?? 0 },
    { label: "Seconds", value: timeLeft.seconds ?? 0 },
  ];

  return (
    <main className="landing-page-bg relative min-h-screen overflow-hidden text-slate-950">
      <div className="landing-grid pointer-events-none absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-teal-400 via-blue-500 to-amber-400" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="landing-rise flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm backdrop-blur">
              <img src="/sunbrilologo.png" alt="Sunbrilo Logo" className="h-11 w-auto sm:h-12" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-teal-700">
                Reward & Recognition
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Culture, celebration, and live engagement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
            {event?.status || "Upcoming"}
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
          <div className="landing-rise text-left">
            <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-teal-700">
              Annual Recognition Experience
            </span>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-7xl">
              Celebrate the people behind every milestone.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Join one place for event updates, live games, awards, certificates, and the moments that make great work visible.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/event"
                target="_blank"
                className="landing-button inline-flex items-center justify-center rounded-2xl bg-slate-950 px-7 py-4 text-sm font-black text-white shadow-xl shadow-slate-300/50 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                View Event Details
              </Link>
              <Link
                to="/employee/login"
                target="_blank"
                className="landing-button inline-flex items-center justify-center rounded-2xl bg-teal-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-teal-200/60 transition hover:-translate-y-0.5 hover:bg-teal-500"
              >
                Employee Login
              </Link>
              <Link
                to="/admin/login"
                target="_blank"
                className="landing-button inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/85 px-7 py-4 text-sm font-black text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                Admin Login
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="landing-rise rounded-2xl border border-white/70 bg-white/75 p-5 text-left shadow-sm backdrop-blur"
                  style={{ animationDelay: `${120 + index * 80}ms` }}
                >
                  <p className="text-3xl font-black text-slate-950">
                    {event?.[stat.key] || stat.fallback}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="landing-rise landing-panel rounded-[2rem] border border-white/70 bg-white/80 p-5 text-left shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:p-6">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
                Current Event
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                {event?.title || "Reward & Recognition 2026"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {event?.subtitle || "Celebrating excellence together"}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Venue", value: event?.venue || "TBD" },
                { label: "Activity", value: event?.currentActivity || "-" },
                {
                  label: "Date & Time",
                  value: event?.eventDate
                    ? new Date(event.eventDate).toLocaleString()
                    : "To be decided",
                },
                { label: "Status", value: event?.status || "Upcoming" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black leading-snug text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {event?.eventDate && (
              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Countdown
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {countdown.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-teal-50 p-3 text-center">
                      <p className="text-2xl font-black text-teal-700">{item.value}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>

        <section className="landing-rise grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <div
              key={item.label}
              className="landing-feature rounded-2xl border border-white/70 bg-white/75 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${220 + index * 90}ms` }}
            >
              <p className="text-sm font-black text-slate-950">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
