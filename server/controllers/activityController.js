import Activity from "../models/Activity.js";

// Get All
export const getActivities = async (req, res) => {
  const activities = await Activity.find().sort({ order: 1 });

  res.json({
    success: true,
    activities,
  });
};

// Create
export const createActivity = async (req, res) => {
  const activity = await Activity.create(req.body);

  res.json({
    success: true,
    activity,
  });
};

// Update
export const updateActivity = async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    success: true,
    activity,
  });
};

// Delete
export const deleteActivity = async (req, res) => {
  await Activity.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Deleted Successfully",
  });
};