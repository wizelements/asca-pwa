interface MemberCardProps {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
}

export default function MemberCard({
  name,
  role,
  bio,
  image,
  email,
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center overflow-hidden">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          {name}
        </h3>
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>
          {role}
        </p>
        {bio && <p className="text-gray-600 text-sm mb-4">{bio}</p>}
        {email && (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 text-sm hover:underline"
          >
            {email}
          </a>
        )}
      </div>
    </div>
  );
}
