import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import { getEmployees } from "../../api/employeeApi";
import { getAwards } from "../../api/awardApi";
import { getCertificates } from "../../api/certificateApi";
import { getQuizAnswers } from "../../api/quizAnswerApi";
import { getPollVotes } from "../../api/pollApi";
import { getTambolaTickets } from "../../api/tambolaApi";
import { FaUsers, FaAward, FaCertificate, FaQuestionCircle, FaPoll, FaGamepad, FaTrophy } from "react-icons/fa";

export default function Reports() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    quizParticipants: 0,
    totalAwards: 0,
    totalWinners: 0,
    certificates: 0,
    pollVotes: 0,
    tambolaTickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, awardsRes, certificatesRes, quizAnswersRes, pollVotesRes, tambolaTicketsRes] = await Promise.all([
          getEmployees(),
          getAwards(),
          getCertificates(),
          getQuizAnswers(),
          getPollVotes(),
          getTambolaTickets()
        ]);

        const employees = employeesRes.data.employees || employeesRes.data || [];
        const awards = awardsRes.data.awards || awardsRes.data || [];
        const certificates = certificatesRes.data.certificates || certificatesRes.data || [];
        const quizAnswers = quizAnswersRes.data.answers || quizAnswersRes.data || [];
        const pollVotes = pollVotesRes.data.votes || pollVotesRes.data || [];
        const tambolaTickets = tambolaTicketsRes.data.tickets || tambolaTicketsRes.data || [];

        // Calculate total winners (unique)
        const allWinners = awards.flatMap(a => a.winners || []);
        const uniqueWinners = new Set(allWinners.map(w => w._id || w)).size;

        // Calculate active employees
        const activeEmployees = employees.filter(e => e.status === "Active").length;

        // Calculate unique quiz participants
        const uniqueQuizParticipants = new Set(quizAnswers.map(a => a.employee)).size;

        setStats({
          totalEmployees: employees.length,
          activeEmployees,
          quizParticipants: uniqueQuizParticipants,
          totalAwards: awards.length,
          totalWinners: uniqueWinners,
          certificates: certificates.length,
          pollVotes: pollVotes.length,
          tambolaTickets: tambolaTickets.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      color: "from-blue-500 to-blue-600",
      icon: <FaUsers className="text-2xl" />
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      color: "from-green-500 to-green-600",
      icon: <FaTrophy className="text-2xl" />
    },
    {
      title: "Quiz Participants",
      value: stats.quizParticipants,
      color: "from-purple-500 to-purple-600",
      icon: <FaQuestionCircle className="text-2xl" />
    },
    {
      title: "Awards Given",
      value: stats.totalAwards,
      color: "from-yellow-500 to-amber-600",
      icon: <FaAward className="text-2xl" />
    },
    {
      title: "Total Winners",
      value: stats.totalWinners,
      color: "from-orange-500 to-orange-600",
      icon: <FaTrophy className="text-2xl" />
    },
    {
      title: "Certificates",
      value: stats.certificates,
      color: "from-indigo-500 to-indigo-600",
      icon: <FaCertificate className="text-2xl" />
    },
    {
      title: "Poll Votes",
      value: stats.pollVotes,
      color: "from-pink-500 to-pink-600",
      icon: <FaPoll className="text-2xl" />
    },
    {
      title: "Tambola Tickets",
      value: stats.tambolaTickets,
      color: "from-teal-500 to-teal-600",
      icon: <FaGamepad className="text-2xl" />
    }
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Reports & Analytics"
        subtitle="View event statistics and reports"
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="opacity-80">{card.icon}</div>
                </div>
                <h3 className="text-sm opacity-90 font-medium mb-1">{card.title}</h3>
                <p className="text-4xl font-extrabold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Event Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Event Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employee Stats */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Employee Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Registered</span>
                    <span className="text-xl font-bold text-slate-800">{stats.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Employees</span>
                    <span className="text-xl font-bold text-green-600">{stats.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Rate</span>
                    <span className="text-xl font-bold text-blue-600">
                      {stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Awards Stats */}
              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Awards & Recognition</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Awards</span>
                    <span className="text-xl font-bold text-slate-800">{stats.totalAwards}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Unique Winners</span>
                    <span className="text-xl font-bold text-yellow-600">{stats.totalWinners}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Certificates Generated</span>
                    <span className="text-xl font-bold text-indigo-600">{stats.certificates}</span>
                  </div>
                </div>
              </div>

              {/* Activities Stats */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Activities</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Quiz Participants</span>
                    <span className="text-xl font-bold text-purple-600">{stats.quizParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Poll Votes Cast</span>
                    <span className="text-xl font-bold text-pink-600">{stats.pollVotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tambola Tickets</span>
                    <span className="text-xl font-bold text-teal-600">{stats.tambolaTickets}</span>
                  </div>
                </div>
              </div>

              {/* Engagement Overview */}
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Engagement Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Quiz Participation</span>
                    <span className="text-xl font-bold text-purple-600">{stats.quizParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Poll Engagement</span>
                    <span className="text-xl font-bold text-pink-600">{stats.pollVotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tambola Players</span>
                    <span className="text-xl font-bold text-teal-600">{stats.tambolaTickets}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}