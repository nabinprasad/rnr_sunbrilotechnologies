import Award from "../models/Award.js";
import Employee from "../models/Employee.js";

// Default seed data based on the requested categories
const DEFAULT_AWARDS = [
  {
    title: "Cross project collaboration",
    category: "Collaboration",
    lever: "Business lever",
    icon: "🤝",
  },
  {
    title: "Quality Champion",
    category: "Execution",
    lever: "Business lever",
    icon: "🛡️",
  },
  {
    title: "Technical Stewardship",
    category: "Execution",
    lever: "Business lever",
    icon: "💻",
  },
  {
    title: "Above and Beyond",
    category: "People",
    lever: "Business lever/ Leadership lever",
    icon: "🚀",
  },
  {
    title: "Best Employee of the year",
    category: "People",
    lever: "Business lever",
    icon: "👑",
  },
  {
    title: "Special Awards",
    category: "People",
    lever: "Business lever",
    icon: "🌟",
  },
  {
    title: "Long service -Silver Jubilee",
    category: "People",
    lever: "Business lever",
    icon: "🥈",
  },
];

// ===========================
// GET ALL AWARDS — READ-ONLY, NO writes.
// Default awards are inserted lazily the first time createAward runs,
// or can be seeded via the admin dashboard. Avoids DB write race at 100 VUs.
// ===========================
export const getAwards = async (req, res) => {
  try {
    let awards = await Award.find()
      .populate("winners")
      .populate("nominees")
      .sort({ createdAt: 1 })
      .lean();

    // Read-only fallback — return defaults as plain objects without
    // touching the database, so parallel GETs never contend on writes.
    if (!awards || awards.length === 0) {
      awards = DEFAULT_AWARDS.map((a, idx) => ({
        ...a,
        _id: `default_${idx}`,
        winners: [],
        nominees: [],
        createdAt: new Date(idx),
      }));
    }

    res.json({ success: true, awards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Utility — returns a Promise to lazily seed default awards once, idempotent.
// We use this in createAward to ensure the DB has defaults before a user
// creates their first award, but only ONCE (not on every GET).
let seedPromise = null;
const ensureDefaultsSeeded = async () => {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const existing = await Award.countDocuments();
      if (existing > 0) return;
      await Award.insertMany(DEFAULT_AWARDS, { ordered: false });
    } catch (e) {
      // Ignore dup key errors — seed already happened in another request.
      if (e && e.code !== 11000) console.warn("Award seed note:", e.message);
    }
  })();
  return seedPromise;
};

// ===========================
// CREATE AWARD
// ===========================
export const createAward = async (req, res) => {
  try {
    const { title, category, lever, icon } = req.body;
    if (!title || !category || !lever) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and lever are required",
      });
    }

    const award = await Award.create({
      title,
      category,
      lever,
      icon: icon || "🏆",
      winners: [],
      nominees: [],
    });

    res.status(201).json({ success: true, award });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// UPDATE AWARD
// ===========================
export const updateAward = async (req, res) => {
  try {
    const { id } = req.params;
    const award = await Award.findByIdAndUpdate(id, req.body, { new: true })
      .populate("winners")
      .populate("nominees");

    if (!award) {
      return res.status(404).json({ success: false, message: "Award not found" });
    }

    res.json({ success: true, award });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// ASSIGN WINNERS
// ===========================
export const assignWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body; // Array of employee IDs e.g. ["id1", "id2"]

    const award = await Award.findById(id);
    if (!award) {
      return res.status(404).json({ success: false, message: "Award not found" });
    }

    if (employeeIds && Array.isArray(employeeIds)) {
      // Validate that all employee IDs exist
      const employees = await Employee.find({ _id: { $in: employeeIds } });
      award.winners = employees.map(emp => emp._id);
    } else {
      award.winners = [];
    }

    await award.save();
    const updatedAward = await Award.findById(id)
      .populate("winners")
      .populate("nominees");

    res.json({ success: true, award: updatedAward });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// ASSIGN NOMINEES
// ===========================
export const assignNominees = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    const award = await Award.findById(id);
    if (!award) {
      return res.status(404).json({ success: false, message: "Award not found" });
    }

    if (employeeIds && Array.isArray(employeeIds)) {
      const employees = await Employee.find({ _id: { $in: employeeIds } });
      award.nominees = employees.map(emp => emp._id);
    } else {
      award.nominees = [];
    }

    await award.save();
    const updatedAward = await Award.findById(id)
      .populate("winners")
      .populate("nominees");

    res.json({ success: true, award: updatedAward });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// DELETE AWARD
// ===========================
export const deleteAward = async (req, res) => {
  try {
    const { id } = req.params;
    const award = await Award.findByIdAndDelete(id);

    if (!award) {
      return res.status(404).json({ success: false, message: "Award not found" });
    }

    res.json({ success: true, message: "Award deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
