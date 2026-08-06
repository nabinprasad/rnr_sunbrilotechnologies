import Event from "../models/Event.js";
import Award from "../models/Award.js";
import Certificate from "../models/Certificate.js";
import Poll from "../models/Poll.js";
import QuizSession from "../models/QuizSession.js";
import TambolaSession from "../models/TambolaSession.js";
import Activity from "../models/Activity.js";

async function calculateStats(event) {
  const ev = event || {};

  // 1) Active Programs: Count of enabled feature flags + total activities
  const featureFlags = [
    ev.quizEnabled,
    ev.pollEnabled,
    ev.tambolaEnabled,
    ev.awardEnabled,
    ev.memoryEnabled,
    ev.luckyDrawEnabled,
    ev.leaderboardEnabled,
  ].filter(Boolean).length;

  let activityCount = 0;
  try {
    activityCount = await Activity.countDocuments();
  } catch (_) {
    // ignore
  }
  const activePrograms = featureFlags + activityCount;

  // 2) Total Rewards: Awards + Certificates
  let awardsCount = 0;
  let certificatesCount = 0;
  try {
    [awardsCount, certificatesCount] = await Promise.all([
      Award.countDocuments(),
      Certificate.countDocuments(),
    ]);
  } catch (_) {
    // ignore
  }
  const totalRewards = awardsCount + certificatesCount;

  // 3) Live Activities: Count of currently running things
  let liveCount = 0;
  try {
    const [quizSess, tambolaSess, activePolls] = await Promise.all([
      QuizSession.findOne().sort({ createdAt: -1 }).select("status -_id").lean(),
      TambolaSession.findOne().sort({ createdAt: -1 }).select("status -_id").lean(),
      Poll.countDocuments({ status: "Active" }),
    ]);
    if (quizSess?.status === "Live") liveCount += 1;
    if (tambolaSess?.status === "Live") liveCount += 1;
    liveCount += Math.min(activePolls || 0, 1); // count as 1 if any active poll
    if (ev.status === "Live") liveCount += 1;
  } catch (_) {
    // ignore
  }

  return {
    activityCount: activePrograms,
    rewardCount: totalRewards,
    liveActivities: liveCount,
  };
}

// Get Event — READ-ONLY path. Never write/upsert on GET, because at 100 VUs
// this creates a race condition of 100 parallel inserts on cold start.
// A "first event" is lazily inserted ONLY by updateEvent (admin action).
export const getEvent = async (req, res) => {
  try {
    let event = await Event.findOne()
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const defaults = {
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
    };

    const baseEvent = event || defaults;
    const stats = await calculateStats(baseEvent);

    res.json({
      success: true,
      event: {
        ...baseEvent,
        ...stats,
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

    const stats = await calculateStats(event.toObject());

    res.json({
      success: true,
      message: "Event Updated Successfully",
      event: {
        ...event.toObject(),
        ...stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
