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
  FaEvernote,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";

const menus = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <FaHome />,
  },
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
  {
    name: "Activities",
    path: "/admin/activities",
    icon: <FaGamepad />,
  },
  {
    name: "Quiz",
    path: "/admin/quiz",
    icon: <FaQuestionCircle />,
  },
  {
    name: "Live Quiz",
    path: "/admin/live-quiz",
    icon: "🎯",
  },
  {
    name: "Live Tambola",
    path: "/admin/live-tambola",
    icon: "🎲",
  },
  {
    name: "Event Control",
    path: "/admin/event-control",
    icon: <FaEvernote />,
  },
  {
    name: "Live Poll",
    path: "/admin/polls",
    icon: <FaPoll />,
  },
  {
    name: "Leaderboard",
    path: "/admin/leaderboard",
    icon: <FaAward />,
  },
  {
    name: "Awards",
    path: "/admin/awards",
    icon: <FaAward />,
  },
  {
    name: "Recognition",
    path: "/admin/recognition",
    icon: <FaAward />,
  },
  {
    name: "Certificates",
    path: "/admin/certificates",
    icon: <FaCertificate />,
  },
  {
    name: "Games",
    path: "/admin/games",
    icon: <FaGamepad />,
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
];

export default function Sidebar({  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen, }) {
  return (
   <aside
  className={`
  fixed top-0 left-0 h-screen bg-white shadow-xl z-50 transition-all duration-300

  ${
    mobileOpen
      ? "translate-x-0"
      : "-translate-x-full"
  }

  md:translate-x-0

  ${
    collapsed
      ? "md:w-20"
      : "md:w-64"
  }

  w-64
`}
>
      {/* Header */}

      <div className="flex items-center justify-between p-4 border-b">

        {!collapsed && (
          <div className="flex gap-3">
            <img
              src="/sunbrilologo.png"
              alt=""
              className="w-16"
            />

            <img
              src="/riskonnectlogo.png"
              alt=""
              className="w-16 bg-white"
            />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xl p-2 rounded-lg hover:bg-gray-100"
        >
          {collapsed ? (
            <FaBars />
          ) : (
            <FaChevronLeft />
          )}
        </button>

      </div>

      {/* Menu */}

      <nav className="mt-4">

        {menus.map((menu) => (

          <NavLink
            key={menu.name}
            to={menu.path}
            title={collapsed ? menu.name : ""}
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "justify-center" : ""
              } gap-4 px-5 py-3 mx-2 rounded-xl transition-all duration-200
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100"
              }`
            }
          >
            <span className="text-xl">{menu.icon}</span>

            {!collapsed && (
              <span className="font-medium">
                {menu.name}
              </span>
            )}

          </NavLink>

        ))}

      </nav>
    </aside>
  );
}