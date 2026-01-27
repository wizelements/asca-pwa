export default function AdminTheme() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Theme Editor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Colors</h2>
          <div className="space-y-6">
            {[
              { label: 'Primary', color: '#1a1a1a', variable: '--color-primary' },
              { label: 'Secondary', color: '#4a4b02', variable: '--color-secondary' },
              { label: 'Accent', color: '#f5d800', variable: '--color-accent' },
              { label: 'Neutral', color: '#ffffff', variable: '--color-neutral' },
            ].map((item) => (
              <div key={item.variable}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {item.label}
                </label>
                <div className="flex gap-4 items-center">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <input
                    type="text"
                    defaultValue={item.color}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Fonts</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sans Serif Font
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>system-ui</option>
                <option>Arial</option>
                <option>Helvetica</option>
                <option>Verdana</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Used for body text and headings</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Serif Font
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Georgia</option>
                <option>Times New Roman</option>
                <option>Garamond</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Used for special typography</p>
            </div>
          </div>
        </div>

        {/* Logo & Favicon */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Logo & Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Logo Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600 text-sm">Drag & drop your logo here, or click to upload</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Favicon
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600 text-sm">Drag & drop your favicon (32x32px) here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-primary mb-6">Preview</h2>
          <div className="bg-gray-100 p-6 rounded-lg min-h-64 flex items-center justify-center text-gray-500">
            <p>Theme preview will appear here</p>
          </div>
        </div>
      </div>

      <button className="btn-accent mt-8 px-8 py-3 text-lg">Save Theme Changes</button>
    </div>
  );
}
