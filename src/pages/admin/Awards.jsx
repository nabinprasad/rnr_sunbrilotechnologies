import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAwards,
  createAward,
  assignWinners,
  assignNominees,
  deleteAward,
} from "../../api/awardApi";
import { getEmployees } from "../../api/employeeApi";
import toast from "react-hot-toast";
import { getEmployeePhotoUrl, DEFAULT_EMPLOYEE_PHOTO } from "../../utils/employeePhoto.js";

// ── Categories metadata ────────────────────────────────
const CATEGORY_COLORS = {
  Collaboration: "bg-blue-100 text-blue-800 border-blue-200",
  Execution: "bg-emerald-100 text-emerald-800 border-emerald-200",
  People: "bg-purple-100 text-purple-800 border-purple-200",
  Other: "bg-slate-100 text-slate-800 border-slate-200",
};

// ── Modals ────────────────────────────────────────────
function AddAwardModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Collaboration");
  const [lever, setLever] = useState("Business lever");
  const [icon, setIcon] = useState("🏆");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Award title is required");

    try {
      setLoading(true);
      await createAward({
        title: title.trim(),
        category,
        lever: lever.trim(),
        icon,
      });
      toast.success("Award category created!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create award");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Add New Award</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Award Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cross project collaboration"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
            >
              <option value="Collaboration">Collaboration</option>
              <option value="Execution">Execution</option>
              <option value="People">People</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Business / Leadership Lever</label>
            <input
              type="text"
              value={lever}
              onChange={(e) => setLever(e.target.value)}
              placeholder="e.g. Business lever"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Icon Emoji</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 text-center text-xl"
              maxLength={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-2.5 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Award"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignEmployeeModal({ award, employees, mode, onClose, onAssigned }) {
  const selectedField = mode === "nominees" ? "nominees" : "winners";
  const title = mode === "nominees" ? "Assign Nominees" : "Assign Winners";
  const saveLabel = mode === "nominees" ? "Save Nominees" : "Save Winners";
  const [selectedIds, setSelectedIds] = useState(() => {
    return award[selectedField] ? award[selectedField].map(item => item._id || item) : [];
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (mode === "nominees") {
        await assignNominees(award._id, selectedIds);
      } else {
        await assignWinners(award._id, selectedIds);
      }
      toast.success(
        selectedIds.length > 0
          ? `${mode === "nominees" ? "Nominees" : "Winners"} assigned!`
          : `${mode === "nominees" ? "Nominees" : "Winners"} cleared!`
      );
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(`Failed to assign ${mode === "nominees" ? "nominees" : "winners"}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees list by search term
  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())) ||
    (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 text-center w-full">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">×</button>
        </div>

        <div className="text-center mb-5">
          <span className="text-4xl">{award.icon}</span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{award.title}</h3>
          <p className="text-slate-500 text-xs mt-1">{award.category} · {award.lever}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Box */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search employee name, department..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
          />

          {/* List of employees */}
          <div className="h-60 overflow-y-auto border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50/50">
            {filtered.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-8">No employees found</p>
            ) : (
              filtered.map((emp) => {
                const checked = selectedIds.includes(emp._id);
                return (
                  <label
                    key={emp._id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${
                      checked
                        ? "bg-purple-50/50 border-purple-200"
                        : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(emp._id)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <img
                      src={getEmployeePhotoUrl(emp.photo)}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                      }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800 leading-none">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {emp.department || "No Department"} · {emp.designation || "No Designation"}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold px-1">
            <span>Selected: {selectedIds.length} employee(s)</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-red-500 hover:text-red-700 transition"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl py-2.5 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectionModal, setSelectionModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [awardsRes, employeesRes] = await Promise.all([
        getAwards(),
        getEmployees(),
      ]);
      setAwards(awardsRes.data.awards);
      // Only keep approved employees for award lists
      setEmployees(employeesRes.data.employees.filter(e => e.approvalStatus === "Approved"));
    } catch (err) {
      toast.error("Failed to load awards or employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete the award "${title}"?`)) return;
    try {
      await deleteAward(id);
      toast.success("Award deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete award");
    }
  };

  const handleClearWinner = async (awardId) => {
    try {
      await assignWinners(awardId, []);
      toast.success("Winner cleared");
      fetchData();
    } catch (err) {
      toast.error("Failed to clear winner");
    }
  };

  // Filter logic
  const filteredAwards = awards.filter((award) => {
    if (activeCategory === "All") return true;
    return award.category === activeCategory;
  });

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Awards Management</h1>
          <p className="text-slate-500 mt-1">Configure event award categories and assign employee winners</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/live-awards"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-purple-300 text-purple-700 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition text-sm"
          >
            📺 Live Presentation
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition shadow text-sm"
          >
            + Add Custom Award
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/60 p-1.5 rounded-xl self-start w-fit">
        {["All", "Collaboration", "Execution", "People", "Other"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
              activeCategory === cat
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Awards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-lg">Loading Awards...</div>
      ) : filteredAwards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-lg font-medium">No awards found in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAwards.map((award) => {
            const winners = award.winners || [];
            const nominees = award.nominees || [];
            return (
              <div
                key={award._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden animate-fadeIn"
              >
                {/* Top Half info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl filter drop-shadow">{award.icon}</span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${CATEGORY_COLORS[award.category] || CATEGORY_COLORS.Other}`}>
                        {award.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {award.lever}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 leading-snug mb-1">
                    {award.title}
                  </h3>
                </div>

                {/* Bottom Half nominee and winner display */}
                <div className="border-t border-slate-50 bg-slate-50/50 p-6 flex flex-col items-center justify-center min-h-[160px]">
                  {nominees.length > 0 && (
                    <div className="w-full mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">
                        Nominees
                      </p>
                      <div className="flex justify-center -space-x-2">
                        {nominees.slice(0, 5).map((nominee) => (
                          <img
                            key={nominee._id}
                            src={getEmployeePhotoUrl(nominee.photo)}
                            alt={nominee.name}
                            title={nominee.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                            }}
                          />
                        ))}
                        {nominees.length > 5 && (
                          <span className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shadow-sm">
                            +{nominees.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {winners.length > 0 ? (
                    winners.length === 1 ? (
                      // Single Winner
                      <div className="text-center w-full flex flex-col items-center">
                        <img
                          src={getEmployeePhotoUrl(winners[0].photo)}
                          alt={winners[0].name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 shadow-md mb-2"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                          }}
                        />
                        <h4 className="font-bold text-slate-800 text-base">{winners[0].name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{winners[0].department} · {winners[0].designation}</p>
                        
                        <button
                          onClick={() => handleClearWinner(award._id)}
                          className="mt-3 text-red-500 hover:text-red-700 font-semibold text-xs transition"
                        >
                          Clear Winner
                        </button>
                      </div>
                    ) : (
                      // Multiple Winners
                      <div className="text-center w-full flex flex-col items-center">
                        <div className="grid grid-cols-2 gap-2 w-full max-h-[120px] overflow-y-auto pr-1">
                          {winners.map((winner) => (
                            <div key={winner._id} className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-xl">
                              <img
                                src={getEmployeePhotoUrl(winner.photo)}
                                alt={winner.name}
                                className="w-8 h-8 rounded-full object-cover shadow-sm border border-purple-200"
                                onError={(event) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = DEFAULT_EMPLOYEE_PHOTO;
                                }}
                              />
                              <div className="text-left leading-tight truncate">
                                <p className="text-xs font-bold text-slate-800 truncate" title={winner.name}>{winner.name}</p>
                                <p className="text-[9px] text-slate-400 truncate">{winner.department}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handleClearWinner(award._id)}
                          className="mt-3 text-red-500 hover:text-red-700 font-semibold text-xs transition"
                        >
                          Clear All Winners
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400 text-sm font-medium mb-3">No Winners Assigned Yet</p>
                      <button
                        onClick={() => setSelectionModal({ award, mode: "winners" })}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-lg transition"
                      >
                        🎯 Assign Winners
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer management action */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setSelectionModal({ award, mode: "nominees" })}
                    className="text-purple-500 hover:text-purple-800 font-semibold"
                  >
                    Nominees
                  </button>
                  <button
                    onClick={() => setSelectionModal({ award, mode: "winners" })}
                    className="text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Change Winner
                  </button>
                  <button
                    onClick={() => handleDelete(award._id, award.title)}
                    className="text-red-400 hover:text-red-600 font-medium"
                  >
                    Delete Award
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Award Modal */}
      {showAddModal && (
        <AddAwardModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchData}
        />
      )}

      {/* Assign Winner Modal */}
      {selectionModal && (
        <AssignEmployeeModal
          award={selectionModal.award}
          mode={selectionModal.mode}
          employees={employees}
          onClose={() => setSelectionModal(null)}
          onAssigned={fetchData}
        />
      )}
    </AdminLayout>
  );
}
