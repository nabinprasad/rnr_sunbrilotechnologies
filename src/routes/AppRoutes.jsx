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

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import EventPage from "../pages/event/EventPage";
import Activities from "../pages/admin/Activities";
import LiveQuizControl from "../pages/admin/LiveQuizControl";
import EmployeeLiveQuiz from "../pages/employee/LiveQuiz";
import LiveQuiz from "../pages/employee/LiveQuiz";
import JoinRequests from "../pages/admin/JoinRequests";

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
<Route
  path="/employee/live-quiz"
  element={<LiveQuiz />}
/>

<Route
  path="/employee/live-quiz"
  element={<EmployeeLiveQuiz />}
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

      {/* Live Quiz */}
      <Route path="/live-quiz" element={<LiveQuiz />} />

      {/* Employee Routes */}
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee/home" element={<EmployeeHome />} />
      <Route path="/employee/lobby" element={<Lobby />} />
    </Routes>
  );
}
