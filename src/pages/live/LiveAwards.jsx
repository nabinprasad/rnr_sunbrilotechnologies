import { useEffect, useState, useRef } from "react";
import { getAwards } from "../../api/awardApi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaStar,
} from "react-icons/fa";

export default function LiveAwards() {
  const [awards, setAwards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is the Welcome/Intro slide
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const bgMusicRef = useRef(null);
  const drumRollRef = useRef(null);
  const applauseRef = useRef(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const res = await getAwards();
      setAwards(res.data.awards);
    } catch (err) {
      console.error("Failed to fetch awards for live view", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = () => {
    // Lower background music
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.08;
    }

    // Play drum roll
    if (drumRollRef.current) {
      drumRollRef.current.currentTime = 0;
      drumRollRef.current.play();
    }

    // Reveal winner after drum roll
    setTimeout(() => {
      setRevealed(true);

      if (applauseRef.current) {
        applauseRef.current.currentTime = 0;
        applauseRef.current.play();
      }

      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.25;
      }
    }, 3500);
  };
  const handleNext = () => {
    // Start music only when Start Presentation is clicked
    if (currentIndex === -1 && bgMusicRef.current) {
      bgMusicRef.current.volume = 0.25;

      if (bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch((err) => console.log(err));
      }
    }

    // Stop applause
    if (applauseRef.current) {
      applauseRef.current.pause();
      applauseRef.current.currentTime = 0;
    }

    // Stop drum roll
    if (drumRollRef.current) {
      drumRollRef.current.pause();
      drumRollRef.current.currentTime = 0;
    }

    if (currentIndex < awards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
    } else {
      // Last award completed
      setShowThankYou(true);

      // Stop all audio except background music
      if (applauseRef.current) {
        applauseRef.current.pause();
        applauseRef.current.currentTime = 0;
      }

      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current.currentTime = 0;
      }
    }
  };

  const handlePrev = () => {
    if (applauseRef.current) {
      applauseRef.current.pause();
      applauseRef.current.currentTime = 0;
    }

    if (drumRollRef.current) {
      drumRollRef.current.pause();
      drumRollRef.current.currentTime = 0;
    }

    setRevealed(false);

    if (currentIndex >= 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">
          Preparing Awards Ceremony...
        </div>
      </div>
    );
  }

  const currentAward = currentIndex >= 0 ? awards[currentIndex] : null;
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center text-white px-8">
        <div className="text-9xl mb-8 animate-bounce">🏆</div>

        <h1 className="text-7xl font-black text-yellow-400 mb-6">THANK YOU</h1>

        <p className="text-3xl text-slate-200 font-semibold">
          Congratulations to all our Winners & Nominees!
        </p>

        <p className="mt-6 text-xl text-slate-400 max-w-3xl leading-relaxed">
          Thank you for being part of our Annual Rewards & Recognition Ceremony.
          Your dedication, teamwork and excellence inspire us every day.
        </p>

        <p className="mt-10 text-3xl font-bold text-yellow-300">
          🌟 See You Next Year! 🌟
        </p>

        <div className="flex gap-10 mt-16">
          <img
            src="/sunbrilologo.png"
            className="h-16 bg-white rounded-xl p-2"
            alt="Sunbrilo"
          />

          <img
            src="/riskonnectlogo.png"
            className="h-16 bg-white rounded-xl p-2"
            alt="Riskonnect"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={bgMusicRef} src="/music/background.mp3" loop />

      <audio ref={drumRollRef} src="/music/drum-roll.mp3" />

      <audio ref={applauseRef} src="/music/applause.mp3" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-10 relative overflow-hidden text-white select-none">
        {/* Confetti and Particle styles */}
        <style>{`
        @keyframes float-particle {
          0% { transform: translateY(105vh) translateX(0) rotate(0deg); opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-5vh) translateX(100px) rotate(360deg); opacity: 0; }
        }
        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: gold;
          border-radius: 50%;
          pointer-events: none;
        }
        .particle:nth-child(even) {
          background: #a855f7;
        }
        .reveal-glow {
          box-shadow: 0 0 50px rgba(250, 204, 21, 0.4), 0 0 100px rgba(168, 85, 247, 0.2);
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp { animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes pulse-gld {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 40px rgba(250, 204, 21, 0.6); }
        }
        .pulse-gold { animation: pulse-gld 3s infinite ease-in-out; }
        @keyframes spin-slw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slw 8s linear infinite; }
      `}</style>

        {/* Background Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `float-particle ${10 + Math.random() * 10}s infinite linear`,
                animationDelay: `${Math.random() * 10}s`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>

        {/* Top Header */}
        <div className="flex justify-between items-center z-10">
          <div className="flex gap-4">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo"
              className="h-12 object-contain bg-white/10 p-1.5 rounded-xl"
            />
            <img
              src="/riskonnectlogo.png"
              alt="Riskonnect"
              className="h-12 object-contain bg-white p-1.5 rounded-xl"
            />
          </div>
          <div className="text-right">
            <span className="text-yellow-400 font-extrabold text-sm uppercase tracking-widest flex items-center gap-1.5 justify-end">
              <FaTrophy /> Annual Awards Ceremony
            </span>
            <p className="text-white/40 text-xs mt-0.5">
              Live Projection Screen
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 py-10">
          {currentIndex === -1 ? (
            /* Welcome Intro Slide */
            <div className="text-center max-w-3xl animate-scaleUp">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg ring-4 ring-yellow-400/30">
                <FaTrophy className="text-white text-5xl" />
              </div>
              <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 tracking-tight leading-tight">
                Awards Ceremony
              </h1>
              <p className="text-slate-300 text-2xl font-medium mt-6 leading-relaxed">
                Celebrating the dedication, collaboration, and execution
                excellence of our outstanding team members.
              </p>
              <button
                onClick={handleNext}
                className="mt-12 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-extrabold px-10 py-4 rounded-2xl shadow-lg shadow-yellow-500/20 text-lg transition duration-200"
              >
                Start Presentation
              </button>
            </div>
          ) : (
            /* Individual Award Slides */
            <div className="w-full max-w-4xl text-center flex flex-col items-center">
              {/* Category / Lever header */}
              <div className="mb-4 animate-fadeIn">
                <span className="inline-block bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-bold uppercase tracking-widest text-xs px-3.5 py-1.5 rounded-full">
                  {currentAward.category} Category
                </span>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-4">
                  {currentAward.lever}
                </p>
              </div>

              {/* Award Title */}
              <h2 className="text-5xl md:text-6xl font-black text-white max-w-3xl leading-tight mb-12 drop-shadow animate-scaleUp">
                {currentAward.title}
              </h2>

              {/* Winner Section */}
              <div className="min-h-[320px] flex items-center justify-center w-full">
                {!revealed ? (
                  /* Reveal button */
                  <button
                    onClick={handleReveal}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 px-12 py-6 rounded-3xl text-2xl font-black tracking-wide pulse-gold flex items-center gap-3 transition"
                  >
                    <FaStar className="text-yellow-400 animate-spin-slow" />{" "}
                    Reveal Winner
                  </button>
                ) : currentAward.winners && currentAward.winners.length > 0 ? (
                  /* Winner revealed details */
                  <div className="flex flex-wrap justify-center gap-12 animate-scaleUp">
                    {currentAward.winners.map((winner) => (
                      <div
                        key={winner._id}
                        className="text-center flex flex-col items-center max-w-[200px]"
                      >
                        <div className="relative mb-5">
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur opacity-75"></div>
                          {winner.photo ? (
                            <img
                              src={winner.photo}
                              alt=""
                              className="relative w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-2xl reveal-glow z-10"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fb =
                                  e.target.parentElement.querySelector(
                                    ".fallback-avatar",
                                  );
                                if (fb)
                                  fb.style.setProperty(
                                    "display",
                                    "flex",
                                    "important",
                                  );
                              }}
                            />
                          ) : null}
                          <div
                            className="fallback-avatar relative w-28 h-28 rounded-full border-4 border-yellow-400 shadow-2xl reveal-glow bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-4xl font-black text-slate-950 z-10"
                            style={{ display: winner.photo ? "none" : "flex" }}
                          >
                            {winner.name
                              ? winner.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span className="absolute bottom-1 right-1 bg-yellow-400 text-slate-900 rounded-full p-1.5 text-base font-bold shadow-lg z-20">
                            👑
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-300 drop-shadow mb-1 whitespace-nowrap">
                          {winner.name}
                        </h3>
                        <p className="text-base text-slate-300 font-semibold truncate w-full">
                          {winner.department}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5 truncate w-full">
                          {winner.designation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No winner assigned */
                  <div className="text-white/40 text-xl font-bold italic animate-fadeIn">
                    No Winners Assigned
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center z-10 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            {currentIndex >= 0 && (
              <button
                onClick={handlePrev}
                className="bg-white/10 hover:bg-white/20 border border-white/10 p-3.5 rounded-xl transition text-white"
                title="Previous Award"
              >
                <FaChevronLeft />
              </button>
            )}
            <span className="text-sm text-white/50 font-bold ml-2">
              {currentIndex >= 0
                ? `Award ${currentIndex + 1} of ${awards.length}`
                : "Welcome"}
            </span>
          </div>

          <div className="flex gap-4">
            {currentIndex >= 0 && (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl flex items-center gap-2 text-sm shadow transition duration-200"
              >
                {currentIndex === awards.length - 1
                  ? "Finish Ceremony"
                  : "Next Award"}

                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
