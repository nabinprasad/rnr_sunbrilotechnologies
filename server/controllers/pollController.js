import Poll from "../models/Poll.js";
import PollVote from "../models/PollVote.js";

// Store active timeout for auto-closing poll
let activePollTimeout = null;
let ioInstance = null;

// Initialize with io instance
export const initPollAutoClose = (io) => {
  ioInstance = io;
  
  // Check for existing active poll and set timeout
  Poll.findOne({ status: "Active" }).then((poll) => {
    if (poll) {
      setPollAutoCloseTimeout(poll);
    }
  }).catch((err) => console.error("Error initializing poll auto-close:", err));
};

// Function to auto-close poll and start next one
const autoClosePollAndStartNext = async (currentPollId) => {
  try {
    // Close current poll
    const currentPoll = await Poll.findById(currentPollId);
    if (currentPoll && currentPoll.status === "Active") {
      currentPoll.status = "Closed";
      await currentPoll.save();
      
      // Emit event for this poll closing
      if (ioInstance) {
        ioInstance.emit("pollUpdated", currentPoll.toObject());
      }
      console.log("⏹️ Auto-closed poll:", currentPollId);
    }

    // Find next poll to activate
    const nextPoll = await Poll.findOne({ 
      status: "Draft",
      _id: { $ne: currentPollId } 
    }).sort({ order: 1, createdAt: 1 });

    if (nextPoll) {
      // Activate next poll
      nextPoll.status = "Active";
      nextPoll.activatedAt = new Date();
      await nextPoll.save();

      // Emit event for new active poll
      if (ioInstance) {
        ioInstance.emit("pollUpdated", nextPoll.toObject());
      }
      console.log("▶️ Auto-started next poll:", nextPoll._id);

      // Set new timeout for next poll
      setPollAutoCloseTimeout(nextPoll);
    } else {
      // No next poll, clear timeout
      if (activePollTimeout) {
        clearTimeout(activePollTimeout);
        activePollTimeout = null;
      }
    }
  } catch (e) {
    console.error("Error in autoClosePollAndStartNext:", e.message);
  }
};

// Function to set auto-close timeout for a poll
const setPollAutoCloseTimeout = (poll) => {
  if (activePollTimeout) {
    clearTimeout(activePollTimeout);
  }

  if (poll.status === "Active" && poll.duration) {
    const timeElapsed = poll.activatedAt 
      ? Date.now() - poll.activatedAt.getTime() 
      : 0;
    const remainingTime = Math.max(0, (poll.duration * 1000) - timeElapsed);

    activePollTimeout = setTimeout(() => {
      autoClosePollAndStartNext(poll._id);
    }, remainingTime);
    console.log("⏱️ Auto-close set for poll:", poll._id, "in", remainingTime / 1000, "seconds");
  }
};

// ===========================
// GET ALL POLLS
// ===========================
export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ order: 1, createdAt: -1 });

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
    const { question, options, allowMultiple, duration, order } = req.body;

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
      duration: duration || 60,
      order: order !== undefined ? order : 0,
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
      
      // Set activatedAt when status changes to Active
      poll.activatedAt = new Date();
    }

    // Update basic fields
    if (req.body.question) poll.question = req.body.question;
    if (req.body.allowMultiple !== undefined) poll.allowMultiple = req.body.allowMultiple;
    if (req.body.status) poll.status = req.body.status;
    if (req.body.duration !== undefined) poll.duration = req.body.duration;
    if (req.body.order !== undefined) poll.order = req.body.order;

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

    // If status is now Active, set auto-close timeout
    if (poll.status === "Active") {
      setPollAutoCloseTimeout(poll);
    }

    // Broadcast to all clients (convert to plain object for better client-side handling)
    try {
      console.log("📡 Emitting pollUpdated event (update):", poll.toObject());
      if (ioInstance) {
        ioInstance.emit("pollUpdated", poll.toObject());
      }
    } catch (e) {
      console.log("Socket emit failed:", e.message);
    }

    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// CLEAR POLL VOTES
// ===========================
export const clearPollVotes = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }
    // Reset votes on each option
    poll.options = poll.options.map(opt => ({ ...opt, votes: 0 }));
    await poll.save();
    
    // Delete all PollVote records for this poll
    await PollVote.deleteMany({ pollId: id });
    
    // Emit socket event to update live poll
    console.log("📡 Emitting pollUpdated event (votes cleared):", poll.toObject());
    if (ioInstance) {
      ioInstance.emit("pollUpdated", poll.toObject());
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

    // Broadcast updated poll (convert to plain object for better client-side handling)
    try {
      console.log("📡 Emitting pollUpdated event:", poll.toObject());
      if (ioInstance) {
        ioInstance.emit("pollUpdated", poll.toObject());
      }
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
