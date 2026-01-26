import { IMember } from '@/lib/models/Member';

interface MemberCardProps {
  member: IMember;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {member.profileImage && (
        <img
          src={member.profileImage}
          alt={`${member.firstName} ${member.lastName}`}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="text-lg font-bold text-primary mb-2">
        {member.firstName} {member.lastName}
      </h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {member.roles.map((role) => (
          <span
            key={role}
            className="px-3 py-1 bg-accent text-primary text-xs font-semibold rounded-full"
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        ))}
      </div>
      {member.bio && <p className="text-gray-700 text-sm mb-2">{member.bio}</p>}
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="text-accent hover:underline text-sm"
        >
          {member.email}
        </a>
      )}
    </div>
  );
}
