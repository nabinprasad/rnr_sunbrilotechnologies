import Poll from "../models/Poll.js";
import PollVote from "../models/PollVote.js";
import { io } from "../server.js";

// ===========================
// GET ALL POLLS
// ===========================
export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });

    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// GET ACTIVE POLL
// ===========================
export const getActivePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({ status: "Active" });

    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// CREATE POLL
// ===========================
export const createPoll = async (req, res) => {
  try {
    const { question, options, allowMultiple } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Question and at least 2 options are required",
      });
    }

    const formattedOptions = options.map((text) => ({ text, votes: 0 }));

    const poll = await Poll.create({
      question,
      options: formattedOptions,
      allowMultiple: allowMultiple || false,
      status: "Draft",
    });

    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// UPDATE POLL (status / question / options)
// ===========================
export const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    // If activating this poll → close any other active poll first
    if (req.body.status === "Active") {
      await Poll.updateMany(
        { status: "Active", _id: { $ne: id } },
        { status: "Closed" }
      );
    }

    // Update basic fields
    if (req.body.question) poll.question = req.body.question;
    if (req.body.allowMultiple !== undefined) poll.allowMultiple = req.body.allowMultiple;
    if (req.body.status) poll.status = req.body.status;

    // Update options while preserving votes if possible
    if (req.body.options && Array.isArray(req.body.options)) {
      const newOptions = req.body.options.map((text, index) => {
        // Try to find an existing option at the same index to preserve votes
        if (poll.options[index]) {
          return { text: text, votes: poll.options[index].votes };
        }
        // If no existing option at this index, create a new one with 0 votes
        return { text: text, votes: 0 };
      });

      poll.options = newOptions;
    }

    await poll.save();

    // Broadcast to all clients
    try {
      io.emit("pollUpdated", poll);
    } catch (e) {
      console.log("Socket emit failed:", e.message);
    }

    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// DELETE POLL
// ===========================
export const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    await Poll.findByIdAndDelete(id);
    await PollVote.deleteMany({ pollId: id });

    res.json({ success: true, message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// SUBMIT VOTE
// ===========================
export const votePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, selectedOptions } = req.body;

    if (!employeeId || !selectedOptions || selectedOptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and selected options are required",
      });
    }

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    if (poll.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This poll is not active",
      });
    }

    // Check for duplicate vote
    const existingVote = await PollVote.findOne({ pollId: id, employeeId });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }

    // Validate options
    const validOptions = selectedOptions.filter(
      (idx) => idx >= 0 && idx < poll.options.length
    );

    if (!poll.allowMultiple && validOptions.length > 1) {
      return res.status(400).json({
        success: false,
        message: "This poll only allows a single choice",
      });
    }

    // Increment vote counts
    validOptions.forEach((idx) => {
      poll.options[idx].votes += 1;
    });

    await poll.save();

    // Record the vote
    await PollVote.create({ pollId: id, employeeId, selectedOptions: validOptions });

    // Broadcast updated poll
    try {
      io.emit("pollUpdated", poll);
    } catch (e) {
      console.log("Socket emit failed:", e.message);
    }

    res.json({ success: true, poll, message: "Vote submitted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// GET ALL POLL VOTES
// ===========================
export const getPollVotes = async (req, res) => {
  try {
    const votes = await PollVote.find();
    res.json({ success: true, votes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// CHECK IF EMPLOYEE VOTED
// ===========================
export const checkVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.query;

    const vote = await PollVote.findOne({ pollId: id, employeeId });

    res.json({ success: true, hasVoted: !!vote, vote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
