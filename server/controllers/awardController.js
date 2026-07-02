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
// GET ALL AWARDS (with auto-seeding if empty)
// ===========================
export const getAwards = async (req, res) => {
  try {
    let awards = await Award.find().populate("winners").sort({ createdAt: 1 });

    if (awards.length === 0) {
      await Award.insertMany(DEFAULT_AWARDS);
      awards = await Award.find().populate("winners").sort({ createdAt: 1 });
    }

    res.json({ success: true, awards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
    const award = await Award.findByIdAndUpdate(id, req.body, { new: true }).populate("winners");

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
    const updatedAward = await Award.findById(id).populate("winners");

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
