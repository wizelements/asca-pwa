export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Site Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Site Title</label>
              <input
                type="text"
                defaultValue="Atlanta Saddle Club Association"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Site Description</label>
              <textarea
                defaultValue="We Ride To Inspire"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Site URL</label>
              <input
                type="url"
                defaultValue="https://atlantasaddleclub.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="btn-accent w-full mt-6">Save Changes</button>
          </div>
        </div>

        {/* Venmo Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Donations (Venmo)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Venmo Username</label>
              <input
                type="text"
                placeholder="your-venmo-handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Preset Amounts</label>
              <div className="space-y-2">
                {[10, 25, 50, 100].map((amount) => (
                  <input
                    key={amount}
                    type="number"
                    defaultValue={amount}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder={`$${amount}`}
                  />
                ))}
              </div>
            </div>
            <button className="btn-accent w-full mt-6">Save Venmo Settings</button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-700">Enable push notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-700">Email on form submissions</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-700">Enable maintenance mode</span>
            </label>
            <button className="btn-accent w-full mt-6">Save Notifications</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-900 mb-6">Danger Zone</h2>
          <p className="text-red-800 text-sm mb-4">These actions cannot be undone.</p>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
