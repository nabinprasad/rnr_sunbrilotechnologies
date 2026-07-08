import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/ui/PageHeader";
import { getEvent, updateEvent } from "../../api/eventApi";
import {
  FaSave,
  FaCalendarAlt,
  FaBuilding,
  FaMicrophone,
  FaBullhorn,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function Settings() {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    eventDate: "",
    venue: "",
    hostMessage: "",
    announcement: "",
    status: "Waiting",
    currentActivity: "",
    quizEnabled: false,
    pollEnabled: false,
    tambolaEnabled: false,
    memoryEnabled: false,
    luckyDrawEnabled: false,
    leaderboardEnabled: false,
    awardEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      const res = await getEvent();
      if (res.data.event) {
        const event = res.data.event;
        setFormData({
          title: event.title || "",
          subtitle: event.subtitle || "",
          eventDate: event.eventDate || "",
          venue: event.venue || "",
          hostMessage: event.hostMessage || "",
          announcement: event.announcement || "",
          status: event.status || "Waiting",
          currentActivity: event.currentActivity || "",
          quizEnabled: event.quizEnabled || false,
          pollEnabled: event.pollEnabled || false,
          tambolaEnabled: event.tambolaEnabled || false,
          memoryEnabled: event.memoryEnabled || false,
          luckyDrawEnabled: event.luckyDrawEnabled || false,
          leaderboardEnabled: event.leaderboardEnabled || false,
          awardEnabled: event.awardEnabled || false,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEvent(formData);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Event Settings"
        subtitle="Configure your reward & recognition event"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Basic Info */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaCalendarAlt className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Event Information</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                placeholder="Enter event subtitle"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaBuilding className="inline mr-2" />
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                placeholder="Enter venue"
              />
            </div>
          </div>
        </div>

        {/* Event Status & Activity */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaBullhorn className="text-purple-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Event Control</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
              >
                <option value="Waiting">Waiting</option>
                <option value="Live">Live</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current Activity
              </label>
              <select
                name="currentActivity"
                value={formData.currentActivity}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
              >
                <option value="">- Select -</option>
                <option value="Quiz">Quiz</option>
                <option value="Poll">Poll</option>
                <option value="Tambola">Tambola</option>
                <option value="Memory Game">Memory Game</option>
                <option value="Lucky Draw">Lucky Draw</option>
                <option value="Awards">Awards</option>
                <option value="Leaderboard">Leaderboard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaMicrophone className="text-yellow-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Event Messages</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Host Message
              </label>
              <textarea
                name="hostMessage"
                value={formData.hostMessage}
                onChange={handleChange}
                rows={3}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none transition"
                placeholder="Enter host message"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Announcement
              </label>
              <textarea
                name="announcement"
                value={formData.announcement}
                onChange={handleChange}
                rows={3}
                className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-yellow-500 focus:outline-none transition"
                placeholder="Enter event announcement"
              />
            </div>
          </div>
        </div>

        {/* Features Toggle */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FaBullhorn className="text-green-600 text-2xl" />
            <h2 className="text-2xl font-bold text-slate-900">Enable Features</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "quizEnabled", label: "Quiz" },
              { name: "pollEnabled", label: "Poll" },
              { name: "tambolaEnabled", label: "Tambola" },
              { name: "memoryEnabled", label: "Memory Game" },
              { name: "luckyDrawEnabled", label: "Lucky Draw" },
              { name: "leaderboardEnabled", label: "Leaderboard" },
              { name: "awardEnabled", label: "Awards" },
            ].map((feature) => (
              <label
                key={feature.name}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-green-300 transition"
              >
                <input
                  type="checkbox"
                  name={feature.name}
                  checked={formData[feature.name]}
                  onChange={handleChange}
                  className="w-5 h-5 accent-green-600"
                />
                <span className="font-semibold text-slate-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all hover:shadow-xl flex items-center gap-3"
          >
            {saving ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <FaSave />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}