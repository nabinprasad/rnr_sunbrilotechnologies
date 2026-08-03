import Event from "../models/Event.js";

// Get Event — READ-ONLY path. Never write/upsert on GET, because at 100 VUs
// this creates a race condition of 100 parallel inserts on cold start.
// A "first event" is lazily inserted ONLY by updateEvent (admin action).
export const getEvent = async (req, res) => {
  try {
    let event = await Event.findOne()
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    res.json({
      success: true,
      event: event || {
        title: "",
        subtitle: "",
        status: "Waiting",
        features: {
          employees: true,
          awards: true,
          polls: true,
          quiz: true,
          tambola: true,
          leaderboard: true,
          certificates: true,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event — handles both update AND initial upsert safely (admin action).
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findOne().sort({ createdAt: -1 });

    if (!event) {
      event = await Event.create(req.body);
    } else {
      event = await Event.findByIdAndUpdate(
        event._id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.json({
      success: true,
      message: "Event Updated Successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};