export default function AdminEvents() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary">Events</h1>
        <button className="btn-accent px-6 py-2">+ New Event</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">RSVPs</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No events yet. Click &quot;+ New Event&quot; to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
        <p><strong>Tip:</strong> Create events here and manage RSVPs. All events require a title, date, location, and image alt text for accessibility.</p>
      </div>
    </div>
  );
}
