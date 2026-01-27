export default function AdminBlog() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-primary">Blog Posts</h1>
        <button className="btn-accent px-6 py-2">+ Write Post</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Author</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Published</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No blog posts yet. Click "+ Write Post" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
