export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Events', value: '0', color: 'bg-blue-100 text-blue-800' },
          { label: 'Total Members', value: '0', color: 'bg-green-100 text-green-800' },
          { label: 'Blog Posts', value: '0', color: 'bg-purple-100 text-purple-800' },
          { label: 'Form Submissions', value: '0', color: 'bg-orange-100 text-orange-800' },
        ].map((stat) => (
          <div key={stat.label} className={`p-6 rounded-lg ${stat.color}`}>
            <p className="text-sm font-semibold">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              + Create New Event
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              + Write Blog Post
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              + Edit Theme
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              + View Submissions
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3 text-gray-600">
            <p className="text-sm">No recent activity yet.</p>
            <p className="text-sm">This will show recent changes as you manage your site.</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Welcome to the Admin Panel</h3>
        <p className="text-blue-800">
          Use the sidebar to manage your site content. All changes are saved to MongoDB and will be reflected on the public site immediately.
        </p>
      </div>
    </div>
  );
}
