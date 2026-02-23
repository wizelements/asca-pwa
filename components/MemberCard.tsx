import Image from 'next/image';
import { IMember } from '@/lib/models/Member';

interface MemberCardProps {
  member: IMember;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {member.profileImage && (
        <div className="relative w-full h-48 mb-4">
          <Image
            src={member.profileImage}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
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
