import Event from "../models/Event.js";

// Get Event
export const getEvent = async (req, res) => {
  try {
    let event = await Event.findOne();

    if (!event) {
      event = await Event.create({});
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findOne();

    if (!event) {
      event = await Event.create(req.body);
    } else {
      event = await Event.findByIdAndUpdate(
        event._id,
        req.body,
        {
          new: true,
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