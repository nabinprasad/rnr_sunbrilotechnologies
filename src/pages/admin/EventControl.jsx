import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getEvent, updateEvent } from "../../api/eventApi";
import toast from "react-hot-toast";

export default function EventControl() {
  const [form, setForm] = useState({
    status: "Waiting",
    currentActivity: "",
    hostMessage: "",
  });

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const res = await getEvent();

      if (res.data.event) {
        setForm(res.data.event);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateEvent(form);

      toast.success("Event Updated Successfully");
    } catch (err) {
      toast.error("Unable to update event");
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">
          Event Control
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="font-semibold">
              Event Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            >
              <option>Waiting</option>
              <option>Live</option>
              <option>Finished</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Current Activity
            </label>

            <select
              name="currentActivity"
              value={form.currentActivity}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            >
              <option value="">Select Activity</option>
              <option>Quiz</option>
              <option>Poll</option>
              <option>Tambola</option>
              <option>Lucky Draw</option>
              <option>Memory Game</option>
              <option>Awards</option>
            </select>
          </div>

        </div>

        <div className="mt-6">

          <label className="font-semibold">
            Host Message
          </label>

          <textarea
            rows="4"
            name="hostMessage"
            value={form.hostMessage}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />

        </div>

        <button
          onClick={handleSave}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          Save Changes
        </button>

      </div>
    </AdminLayout>
  );
}