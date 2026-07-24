import { useEffect, useState, useRef } from "react";
import { getAwards } from "../../api/awardApi";
import { getCertificates } from "../../api/certificateApi";
import { generateCertificate } from "../../utils/certificateGenerator";
import { getEmployeePhotoUrl, DEFAULT_EMPLOYEE_PHOTO } from "../../utils/employeePhoto.js";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaStar,
  FaPlay,
  FaPause,
  FaMicrophone,
} from "react-icons/fa";

export default function LiveAwards() {
  const [awards, setAwards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is Welcome, -2 is Spin Wheel
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [certificateUrls, setCertificateUrls] = useState({});
  const bgMusicRef = useRef(null);
  const drumRollRef = useRef(null);
  const applauseRef = useRef(null);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const currentAward = currentIndex >= 0 ? awards[currentIndex] : null;
  const nominees = currentAward?.nominees || [];

  // Collect all unique winners from all awards
  const allWinners = Array.from(
    new Map(
      awards.flatMap((award) => award.winners || []).map((w) => [w._id, w])
    ).values()
  );

  const colors = [
    "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181",
    "#AA96DA", "#FCBAD3", "#A8D8EA", "#FFD93D", "#6BCB77",
    "#4D96FF", "#FF6B6B"
  ];

  useEffect(() => {
    fetchAwards();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!bgMusicRef.current) return;

    const audio = bgMusicRef.current;
    const onPlay = () => setIsBgMusicPlaying(true);
    const onPause = () => setIsBgMusicPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    setIsBgMusicPlaying(!audio.paused);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [loading, showSpinWheel, showThankYou]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const [awardsRes, certificatesRes] = await Promise.all([
        getAwards(),
        getCertificates(),
      ]);
      setAwards(awardsRes.data.awards);
      setCertificates(certificatesRes.data.certificates || []);
    } catch (err) {
      console.error("Failed to fetch awards for live view", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBgMusic = async () => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (!audio.volume) audio.volume = 0.25;

    try {
      await audio.play();
    } catch (err) {
      console.log(err);
    }
  };

  const renderMusicController = () => {
    return (
      <div className="fixed top-6 left-6 z-50">
        <button
          type="button"
          onClick={toggleBgMusic}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white px-4 py-3 rounded-2xl shadow-lg transition duration-200 flex items-center gap-3"
          title={isBgMusicPlaying ? "Pause music" : "Play music"}
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center shadow">
            {isBgMusicPlaying ? <FaPause /> : <FaPlay />}
          </span>
          <span className="hidden md:inline text-sm font-extrabold tracking-wide">
            {isBgMusicPlaying ? "Pause Music" : "Play Music"}
          </span>
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (!revealed || !currentAward?.winners?.length) return;

    currentAward.winners.forEach(async (winner) => {
      const winnerId = winner._id || winner;
      const certificate = certificates.find((cert) => {
        const certEmployeeId = cert.employeeId?._id || cert.employeeId;
        return String(certEmployeeId) === String(winnerId);
      });

      if (!certificate || certificateUrls[winnerId]) return;

      const url = await generateCertificate(
        certificate.templateName,
        certificate.employeeName || winner.name,
        certificate._id,
        false,
      );

      if (url) {
        setCertificateUrls((prev) => ({
          ...prev,
          [winnerId]: url,
        }));
      }
    });
  }, [revealed, currentAward, certificates, certificateUrls]);

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
  // Spin wheel logic
  const spinWheel = () => {
    if (allWinners.length === 0) return;
    
    setIsSpinning(true);
    setSelectedWinner(null);
    setTimerActive(false);
    setTimer(120);

    // Play drum roll
    if (drumRollRef.current) {
      drumRollRef.current.currentTime = 0;
      drumRollRef.current.play();
    }

    const randomIndex = Math.floor(Math.random() * allWinners.length);
    const randomWinner = allWinners[randomIndex];
    const segmentAngle = 360 / allWinners.length;
    const randomRotation = 360 * 5 + (360 - (randomIndex * segmentAngle + segmentAngle / 2));
    
    setRotation(randomRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedWinner(randomWinner);

      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current.currentTime = 0;
      }

      if (applauseRef.current) {
        applauseRef.current.currentTime = 0;
        applauseRef.current.play();
      }
    }, 4000);
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
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

    if (showSpinWheel) {
      setShowSpinWheel(false);
      setShowThankYou(true);
    } else if (currentIndex < awards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
    } else {
      // Last award completed - show spin wheel
      setShowSpinWheel(true);
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

    if (showSpinWheel) {
      setShowSpinWheel(false);
      setSelectedWinner(null);
      setTimer(120);
      setTimerActive(false);
    } else if (currentIndex >= 0) {
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

  // Spin Wheel Slide
  if (showSpinWheel) {
    return (
      <>
        <audio ref={bgMusicRef} src="/music/background.mp3" loop />
        <audio ref={drumRollRef} src="/music/drum-roll.mp3" />
        <audio ref={applauseRef} src="/music/applause.mp3" />

        {renderMusicController()}

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-10 relative overflow-hidden text-white">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 2 === 0 ? "#FFD93D" : "#A855F7",
                  animation: `float-particle ${8 + Math.random() * 8}s infinite linear`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center z-10">
            <div className="flex gap-4">
              <img
                src="/sunbrilologo.png"
                alt="Sunbrilo"
                className="h-12 object-contain bg-white/10 p-1.5 rounded-xl"
              />
            </div>
            <div className="text-right">
              <span className="text-yellow-400 font-extrabold text-sm uppercase tracking-widest flex items-center gap-1.5 justify-end">
                <FaTrophy /> Winner's Lucky Spin
              </span>
              <p className="text-white/40 text-xs mt-0.5">Live Projection Screen</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center z-10 py-10">
            {!selectedWinner ? (
              <div className="text-center animate-scaleUp w-full max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-8">
                  🎯 Who Will Speak First? 🎯
                </h2>

                {allWinners.length > 0 ? (
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative w-72 h-72 md:w-96 md:h-96">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transition: isSpinning
                            ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                            : "none",
                        }}
                      >
                        {allWinners.map((winner, index) => {
                          const angle = 360 / allWinners.length;
                          const startAngle = index * angle;
                          const endAngle = (index + 1) * angle;
                          const x1 = 50 + 48 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                          const y1 = 50 + 48 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                          const x2 = 50 + 48 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                          const y2 = 50 + 48 * Math.sin(((endAngle - 90) * Math.PI) / 180);
                          const largeArc = angle > 180 ? 1 : 0;

                          return (
                            <g key={winner._id}>
                              <path
                                d={`M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={colors[index % colors.length]}
                                stroke="#ffffff"
                                strokeWidth="0.5"
                              />
                              <text
                                x="50"
                                y="50"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="2.5"
                                fill="#000"
                                fontWeight="bold"
                                transform={`rotate(${(startAngle + endAngle) / 2} 50 50) translate(0 -25)`}
                              >
                                {winner.name.split(" ")[0]}
                              </text>
                            </g>
                          );
                        })}
                        <circle cx="50" cy="50" r="5" fill="#fff" />
                      </svg>

                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] border-t-yellow-400 drop-shadow-lg"></div>
                      </div>

                      <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl md:text-3xl shadow-2xl z-30 transition-all duration-300 ${
                          isSpinning ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
                        }`}
                      >
                        <FaPlay />
                      </button>
                    </div>

                    <p className="text-lg text-slate-300 font-semibold">
                      {allWinners.length} lucky winners in the draw!
                    </p>
                  </div>
                ) : (
                  <div className="text-2xl text-slate-400 font-bold">No winners to spin yet!</div>
                )}
              </div>
            ) : (
              <div className="text-center animate-scaleUp w-full max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-8">
                  🎉 Congratulations! 🎉
                </h2>

                <div className="relative mb-8 inline-block">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-lg opacity-75"></div>
                  <img
                    src={getEmployeePhotoUrl(selectedWinner.photo)}
                    alt={selectedWinner.name}
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-yellow-400 shadow-2xl"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                    }}
                  />
                </div>

                <h3 className="text-4xl md:text-5xl font-black text-white mb-2">
                  {selectedWinner.name}
                </h3>
                <p className="text-xl md:text-2xl text-slate-300 font-semibold mb-8">
                  {selectedWinner.department} • {selectedWinner.designation}
                </p>

                <div className="bg-white/5 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-6 md:p-8 w-full max-w-lg mx-auto mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <FaMicrophone className="text-yellow-400 text-3xl" />
                    <h4 className="text-2xl md:text-3xl font-black text-yellow-400">
                      Time to Speak!
                    </h4>
                  </div>
                  <div className="text-6xl md:text-7xl font-black text-white font-mono">
                    {formatTime(timer)}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                      timerActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    } text-white shadow-lg`}
                  >
                    {timerActive ? "⏸️ Pause" : "▶️ Start"}
                  </button>
                  <button
                    onClick={() => {
                      setTimer(120);
                      setTimerActive(false);
                    }}
                    className="px-8 py-4 rounded-2xl font-bold text-lg bg-slate-600 hover:bg-slate-700 text-white shadow-lg transition-all duration-200"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center z-10 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="bg-white/10 hover:bg-white/20 border border-white/10 p-3.5 rounded-xl transition text-white"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-white/50 font-bold ml-2">Lucky Spin</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl flex items-center gap-2 text-sm shadow transition duration-200"
              >
                Finish Ceremony
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showThankYou) {
    return (
      <>
        <audio ref={bgMusicRef} src="/music/background.mp3" loop />
        <audio ref={drumRollRef} src="/music/drum-roll.mp3" />
        <audio ref={applauseRef} src="/music/applause.mp3" />

        {renderMusicController()}

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center px-4 md:px-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>

            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-6xl ">
            <div className="mt-5 flex">
              <img
                src="/sunbrilologo.png"
                className="h-17 md:h-17 bg-white rounded-2xl p-3 shadow-xl"
                alt="Sunbrilo"
              />
              <div className="text-5xl md:text-5xl animate-bounce flex flex-center">🏆</div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-300 bg-clip-text text-transparent">
              THANK YOU
            </h1>

            <p className="text-lg md:text-2xl text-slate-200 font-semibold">
              Congratulations to all our Winners & Nominees!
            </p>

            <div
              className="mx-auto w-full max-w-5xl
bg-white/5 backdrop-blur-xl
border border-yellow-400/20
rounded-3xl
px-8 md:px-14
py-8
shadow-[0_0_60px_rgba(250,204,21,0.12)]"
            >
              <p className="text-xl md:text-2xl font-bold">
                People might forget
                <span className="text-yellow-400"> what you SAID</span>
              </p>

              <p className="mt-4 text-xl md:text-2xl font-bold">
                People might forget
                <span className="text-yellow-400"> what you DID</span>
              </p>

              <div className="w-28 h-[3px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto my-6"></div>

              <p className="text-3xl md:text-3xl font-black leading-snug">
                <span className="text-yellow-300">But people will</span>

                <span className="text-white"> NEVER </span>

                <span className="text-yellow-300">forget</span>

                <br />

                <span className="text-white">how you made them</span>

                <span className="text-yellow-400"> FEEL.</span>
              </p>
            </div>

            <p className="mt-10 text-lg md:text-2xl text-slate-300">
              Thank you for making this celebration memorable.
            </p>

            <p className="mt-6 text-3xl md:text-5xl font-black text-yellow-400 animate-pulse">
              ✨ See You Next Year! ✨
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <audio ref={bgMusicRef} src="/music/background.mp3" loop />

      <audio ref={drumRollRef} src="/music/drum-roll.mp3" />

      <audio ref={applauseRef} src="/music/applause.mp3" />
      {renderMusicController()}
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
              <div className="min-h-[360px] flex items-center justify-center w-full">
                {!revealed ? (
                  <div className="w-full flex flex-col items-center animate-fadeIn">
                    <p className="text-yellow-300 font-black uppercase tracking-[0.3em] text-sm mb-8">
                      Nominees
                    </p>

                    {nominees.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-8 mb-12">
                        {nominees.map((nominee) => (
                          <div
                            key={nominee._id}
                            className="flex flex-col items-center text-center max-w-[170px]"
                          >
                            <div className="relative mb-4">
                              <img
                                src={getEmployeePhotoUrl(nominee.photo)}
                                alt={nominee.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                                }}
                              />
                            </div>
                            <h3 className="text-xl font-black text-white drop-shadow truncate w-full">
                              {nominee.name}
                            </h3>
                            <p className="text-sm text-slate-300 font-semibold truncate w-full">
                              {nominee.department}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5 truncate w-full">
                              {nominee.designation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-white/40 text-xl font-bold italic mb-12">
                        No Nominees Assigned
                      </div>
                    )}

                    <button
                      onClick={handleReveal}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-12 py-6 rounded-3xl text-2xl font-black tracking-wide pulse-gold flex items-center gap-3 transition"
                    >
                      <FaStar className="text-yellow-400 animate-spin-slow" />{" "}
                      Reveal Winner
                    </button>
                  </div>
                ) : currentAward.winners && currentAward.winners.length > 0 ? (
                  /* Winner revealed details */
                  <div className="flex flex-wrap justify-center gap-10 animate-scaleUp">
                        {currentAward.winners.map((winner) => (
                          <div
                            key={winner._id}
                            className="text-center flex flex-col items-center max-w-[360px]"
                          >
                            <div className="relative mb-5">
                              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur opacity-75"></div>
                              <img
                                src={getEmployeePhotoUrl(winner.photo)}
                                alt={winner.name}
                                className="relative w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-2xl reveal-glow z-10"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                                }}
                              />
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
                            {certificateUrls[winner._id] ? (
                              <div className="mt-6 w-[320px] max-w-[80vw]">
                                <div className="rounded-2xl overflow-hidden border border-yellow-300/30 bg-white shadow-2xl aspect-[4/3]">
                                  <iframe
                                    src={`${certificateUrls[winner._id]}#toolbar=0&navpanes=0`}
                                    className="w-full h-full border-none pointer-events-none"
                                    title={`${winner.name} Certificate`}
                                  />
                                </div>
                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
                                  Certificate
                                </p>
                              </div>
                            ) : (
                              <p className="mt-5 text-xs font-semibold text-white/40">
                                Certificate not generated yet
                              </p>
                            )}
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
