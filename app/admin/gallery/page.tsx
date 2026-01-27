export default function AdminGallery() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary">Gallery</h1>
        <button className="btn-accent px-6 py-2">+ Upload Images</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            <p className="text-gray-500">Gallery item {i}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
        <p><strong>Tip:</strong> All images require alt text for accessibility. Don't forget to add descriptive alt text for each image.</p>
      </div>
    </div>
  );
}
