export default function AdminForms() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary">Form Submissions</h1>
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All Forms</option>
          <option>Membership</option>
          <option>Volunteer</option>
          <option>Contact</option>
          <option>Donation</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Form Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No form submissions yet. Members will appear here after they submit forms.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg text-sm text-green-800">
        <p><strong>Offline Submissions:</strong> Forms submitted offline will sync automatically when the user reconnects to the internet.</p>
      </div>
    </div>
  );
}
