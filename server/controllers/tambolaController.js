import TambolaSession from "../models/TambolaSession.js";
import TambolaTicket from "../models/TambolaTicket.js";
import TambolaClaim from "../models/TambolaClaim.js";
import Employee from "../models/Employee.js";
import Event from "../models/Event.js";
import { io } from "../server.js";
import {
  generateTambolaTicket,
  validateClaim,
} from "../utils/tambolaTicketGenerator.js";

const CLAIM_LABELS = {
  earlyFive: "Early Five",
  middleLine: "Middle Line",
  fullHouse: "Full House",
};

function emitSessionUpdate(session) {
  try {
    const sessionObj = session.toObject();
    console.log("📡 Emitting tambolaSessionUpdated event:", sessionObj);
    io.emit("tambolaSessionUpdated", sessionObj);
  } catch (err) {
    console.log("Socket emit failed:", err.message);
  }
}

function emitClaimUpdate(claim) {
  try {
    const claimObj = claim.toObject();
    console.log("📡 Emitting tambolaClaimUpdated event:", claimObj);
    io.emit("tambolaClaimUpdated", claimObj);
  } catch (err) {
    console.log("Socket emit failed:", err.message);
  }
}

export const getSession = async (req, res) => {
  try {
    let session = await TambolaSession.findOne();

    if (!session) {
      session = await TambolaSession.create({});
    }

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const startSession = async (req, res) => {
  try {
    await TambolaTicket.deleteMany({});
    await TambolaClaim.deleteMany({});

    const employees = await Employee.find({
      status: "Active",
      approvalStatus: "Approved",
    });

    for (const employee of employees) {
      await TambolaTicket.create({
        employee: employee._id,
        employeeName: employee.name,
        grid: generateTambolaTicket(),
      });
    }

    let session = await TambolaSession.findOne();

    if (!session) {
      session = await TambolaSession.create({});
    }

    session.status = "Live";
    session.calledNumbers = [];
    session.currentNumber = null;
    session.winners = {
      earlyFive: null,
      middleLine: null,
      fullHouse: null,
    };

    await session.save();
    emitSessionUpdate(session);

    const event = await Event.findOne();
    if (event) {
      event.currentActivity = "Tambola";
      event.tambolaEnabled = true;
      await event.save();
    }

    res.json({
      success: true,
      session,
      ticketsGenerated: employees.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const callNextNumber = async (req, res) => {
  try {
    const session = await TambolaSession.findOne();

    if (!session || session.status !== "Live") {
      return res.status(400).json({
        success: false,
        message: "Tambola session is not live",
      });
    }

    const called = new Set(session.calledNumbers);
    const remaining = [];

    for (let num = 1; num <= 90; num += 1) {
      if (!called.has(num)) {
        remaining.push(num);
      }
    }

    if (remaining.length === 0) {
      session.status = "Finished";
      await session.save();
      emitSessionUpdate(session);

      return res.json({
        success: true,
        session,
        message: "All numbers have been called",
      });
    }

    const nextNumber =
      remaining[Math.floor(Math.random() * remaining.length)];

    session.calledNumbers.push(nextNumber);
    session.currentNumber = nextNumber;
    await session.save();
    emitSessionUpdate(session);

    res.json({
      success: true,
      session,
      number: nextNumber,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await TambolaSession.findOne();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "Finished";
    await session.save();
    emitSessionUpdate(session);

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const resetSession = async (req, res) => {
  try {
    await TambolaTicket.deleteMany({});
    await TambolaClaim.deleteMany({});

    let session = await TambolaSession.findOne();

    if (!session) {
      session = await TambolaSession.create({});
    }

    session.status = "Waiting";
    session.calledNumbers = [];
    session.currentNumber = null;
    session.winners = {
      earlyFive: null,
      middleLine: null,
      fullHouse: null,
    };

    await session.save();
    emitSessionUpdate(session);

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const ticket = await TambolaTicket.findOne({ employee: employeeId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found. Wait for admin to start tambola.",
      });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await TambolaTicket.find().sort({ employeeName: 1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const submitClaim = async (req, res) => {
  try {
    const { employeeId, employeeName, claimType } = req.body;

    const session = await TambolaSession.findOne();

    if (!session || session.status !== "Live") {
      return res.status(400).json({
        success: false,
        message: "Tambola is not live",
      });
    }

    if (session.winners?.[claimType]) {
      return res.status(400).json({
        success: false,
        message: `${CLAIM_LABELS[claimType]} has already been won`,
      });
    }

    const existingPending = await TambolaClaim.findOne({
      employee: employeeId,
      claimType,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "Claim already submitted and pending review",
      });
    }

    const ticket = await TambolaTicket.findOne({ employee: employeeId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isValid = validateClaim(
      ticket.grid,
      session.calledNumbers,
      claimType
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Claim is not valid for your ticket",
      });
    }

    const claim = await TambolaClaim.create({
      employee: employeeId,
      employeeName,
      claimType,
    });

    emitClaimUpdate(claim);

    res.json({
      success: true,
      claim,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getClaims = async (req, res) => {
  try {
    const claims = await TambolaClaim.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      claims,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const reviewClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { action } = req.body;

    const claim = await TambolaClaim.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Claim already reviewed",
      });
    }

    const session = await TambolaSession.findOne();

    if (action === "approve") {
      if (session?.winners?.[claim.claimType]) {
        return res.status(400).json({
          success: false,
          message: `${CLAIM_LABELS[claim.claimType]} already awarded`,
        });
      }

      claim.status = "Approved";

      if (session) {
        session.winners[claim.claimType] = claim.employeeName;
        await session.save();
        emitSessionUpdate(session);
      }
    } else {
      claim.status = "Rejected";
    }

    await claim.save();
    emitClaimUpdate(claim);

    res.json({
      success: true,
      claim,
      session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
