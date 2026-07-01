import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getActivities,
  addActivity,
  deleteActivity,
} from "../../api/activityApi";
import toast from "react-hot-toast";

export default function Activities() {
  const [activities, setActivities] = useState([]);

  const [form, setForm] = useState({
    title: "",
    icon: "",
    route: "",
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await getActivities();
      setActivities(res.data.activities);
    } catch {
      toast.error("Unable to load activities");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addActivity(form);

      toast.success("Activity Added");

      setForm({
        title: "",
        icon: "",
        route: "",
      });

      fetchActivities();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Activity?")) return;

    await deleteActivity(id);

    toast.success("Deleted");

    fetchActivities();
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-8">

        <h2 className="text-3xl font-bold mb-6">
          Activity Management
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <input
            placeholder="Activity Name"
            className="border p-3 rounded-lg"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <input
            placeholder="Emoji"
            className="border p-3 rounded-lg"
            value={form.icon}
            onChange={(e) =>
              setForm({
                ...form,
                icon: e.target.value,
              })
            }
          />

          <input
            placeholder="/quiz"
            className="border p-3 rounded-lg"
            value={form.route}
            onChange={(e) =>
              setForm({
                ...form,
                route: e.target.value,
              })
            }
          />

          <button className="bg-blue-600 text-white rounded-lg">
            Add Activity
          </button>
        </form>

        <table className="w-full border">

          <thead className="bg-slate-800 text-white">

            <tr>

              <th className="p-3">Icon</th>

              <th>Name</th>

              <th>Route</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {activities.map((item) => (

              <tr key={item._id} className="border-b">

                <td className="text-center">{item.icon}</td>

                <td>{item.title}</td>

                <td>{item.route}</td>

                <td>
                  {item.enabled ? "Enabled" : "Disabled"}
                </td>

                <td>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </AdminLayout>
  );
}