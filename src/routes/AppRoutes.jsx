import { Routes, Route } from "react-router-dom";

import Home from "../pages/event/Home";
import AdminLogin from "../pages/auth/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import Employees from "../pages/admin/Employees";
import Quiz from "../pages/admin/Quiz";
import EventControl from "../pages/admin/EventControl";
import Polls from "../pages/admin/Poll";
import EmployeeLogin from "../pages/employee/Login";
import EmployeeHome from "../pages/employee/Home";
import Lobby from "../pages/employee/Lobby";
import Leaderboard from "../pages/admin/Leaderboard";
import Awards from "../pages/admin/Awards";
import Certificates from "../pages/admin/Certificates";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import EventPage from "../pages/event/EventPage";
import Activities from "../pages/admin/Activities";
import LiveQuizControl from "../pages/admin/LiveQuizControl";
import EmployeeLiveQuiz from "../pages/employee/LiveQuiz";
import LiveQuiz from "../pages/live/LiveQuiz";
import JoinRequests from "../pages/admin/JoinRequests";
import LiveTambolaControl from "../pages/admin/LiveTambolaControl";
import EmployeeTambola from "../pages/employee/Tambola";
import LiveTambola from "../pages/live/LiveTambola";
import EmployeeLivePoll from "../pages/employee/LivePoll";
import LivePollScreen from "../pages/live/LivePoll";
import VerifyCertificate from "../pages/live/VerifyCertificate";
import LiveAwards from "../pages/live/LiveAwards";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Website */}
      <Route path="/" element={<Home />} />
      <Route path="/event" element={<EventPage />} />

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        }
      />
<Route
  path="/admin/join-requests"
  element={<JoinRequests />}
/>
      <Route
        path="/admin/activities"
        element={
          <ProtectedRoute>
            <Activities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin/live-quiz"
  element={
    <ProtectedRoute>
      <LiveQuizControl />
    </ProtectedRoute>
  }
/>
<Route path="/employee/live-quiz" element={<EmployeeLiveQuiz />} />
<Route path="/employee/tambola" element={<EmployeeTambola />} />

      <Route
  path="/admin/live-tambola"
  element={
    <ProtectedRoute>
      <LiveTambolaControl />
    </ProtectedRoute>
  }
/>

      <Route
        path="/admin/event-control"
        element={
          <ProtectedRoute>
            <EventControl />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/polls"
        element={
          <ProtectedRoute>
            <Polls />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/awards"
        element={
          <ProtectedRoute>
            <Awards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/certificates"
        element={
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Live Quiz / Tambola / Poll / Verification / Awards */}
      <Route path="/live-quiz" element={<LiveQuiz />} />
      <Route path="/live-tambola" element={<LiveTambola />} />
      <Route path="/live-poll" element={<LivePollScreen />} />
      <Route path="/live-awards" element={<LiveAwards />} />
      <Route path="/verify-certificate/:id" element={<VerifyCertificate />} />

      {/* Employee Routes */}
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee/home" element={<EmployeeHome />} />
      <Route path="/employee/lobby" element={<Lobby />} />
      <Route path="/employee/live-poll" element={<EmployeeLivePoll />} />
    </Routes>
  );
}
