import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaQuestionCircle,
  FaPoll,
  FaAward,
  FaCertificate,
  FaGamepad,
  FaChartBar,
  FaCog,
  FaBars,
  FaChevronLeft,
  FaExternalLinkAlt,
} from "react-icons/fa";

// Group menu items for better organization
const menuGroups = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <FaHome />,
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        name: "Employees",
        path: "/admin/employees",
        icon: <FaUsers />,
      },
      {
        name: "Join Requests",
        path: "/admin/join-requests",
        icon: "🙋",
      },
    ],
  },
  {
    title: "Live Events",
    items: [
      {
        name: "Quiz Management",
        path: "/admin/quiz",
        icon: <FaQuestionCircle />,
      },
      {
        name: "Live Quiz Control",
        path: "/admin/live-quiz",
        icon: "🧠⚙️",
      },
      {
        name: "Live Quiz",
        path: "/live-quiz",
        icon: "🧠",
        newTab: true,
      },
      {
        name: "Live Tambola Control",
        path: "/admin/live-tambola",
        icon: "🎲⚙️",
      },
      {
        name: "Live Tambola",
        path: "/live-tambola",
        icon: "🎲",
        newTab: true,
      },
      {
        name: "Event Control",
        path: "/admin/event-control",
        icon: <FaGamepad />,
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        name: "Polls",
        path: "/admin/polls",
        icon: <FaPoll />,
      },
      {
        name: "Live Poll",
        path: "/live-poll",
        icon: "📊",
        newTab: true,
      },
      {
        name: "Leaderboard",
        path: "/admin/leaderboard",
        icon: <FaAward />,
      },
    ],
  },
  {
    title: "Recognition",
    items: [
      {
        name: "Awards",
        path: "/admin/awards",
        icon: <FaAward />,
      },
      {
        name: "Certificates",
        path: "/admin/certificates",
        icon: <FaCertificate />,
      },
    ],
  },
  {
    title: "Analytics & Settings",
    items: [
      {
        name: "Live Results",
        path: "/live-results",
        icon: "📈",
        newTab: true,
      },
      {
        name: "Reports",
        path: "/admin/reports",
        icon: <FaChartBar />,
      },
      {
        name: "Settings",
        path: "/admin/settings",
        icon: <FaCog />,
      },
    ],
  },
];

export default function Sidebar({ collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen, }) {
  return (
    <aside
      className={`
  fixed top-0 left-0 h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 shadow-xl z-50 transition-all duration-300 flex flex-col overflow-hidden border-r border-purple-100

  ${mobileOpen
          ? "translate-x-0"
          : "-translate-x-full"
        }

  md:translate-x-0

  ${collapsed
          ? "md:w-20"
          : "md:w-72"
        }

  w-72
`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-purple-100 shrink-0 bg-gradient-to-r from-purple-100/80 to-indigo-100/80">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo Logo"
              className="w-14 h-14 object-contain rounded-xl shadow-md"
            />
            <div className="flex flex-col">
              <span className="text-slate-800 font-bold text-lg tracking-wide">Sunbrilo</span>
              <span className="text-purple-600 text-xs">Admin Panel</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo Logo"
              className="w-12 h-12 object-contain rounded-xl"
            />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-600 hover:text-slate-800 hover:bg-white/70 p-2 rounded-xl transition-all duration-200"
        >
          {collapsed ? (
            <FaBars />
          ) : (
            <FaChevronLeft />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-200/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-purple-300">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-purple-700 uppercase tracking-wider opacity-80">
                {group.title}
              </div>
            )}

            {group.items.map((menu) => (
              <NavLink
                key={menu.name}
                to={menu.path}
                title={collapsed ? menu.name : ""}
                target={menu.newTab ? "_blank" : undefined}
                rel={menu.newTab ? "noopener noreferrer" : undefined}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? "justify-center px-3" : "px-4"} gap-3 py-3 mb-1 rounded-xl transition-all duration-300 group relative ${
                    isActive 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/60" 
                      : "text-slate-700 hover:bg-white hover:text-purple-700 hover:shadow-md"
                  }`
                }
              >
                <span className="text-2xl min-w-[30px] flex justify-center">{menu.icon}</span>
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium tracking-wide">{menu.name}</span>
                    {menu.newTab && <FaExternalLinkAlt className="text-xs opacity-60" />}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
