import Image from 'next/image';

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
    <div className="card text-center">
      {image && (
        <div className="relative h-56 w-full">
          <Image
            src={image}
            alt={name}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-fg-muted">{role}</p>
        <h3 className="mt-2 text-xl font-bold text-brand-fg-primary">{name}</h3>
        {bio && <p className="mt-3 text-sm text-brand-fg-secondary">{bio}</p>}
        {email && (
          <a
            href={`mailto:${email}`}
            className="mt-4 inline-flex text-xs uppercase tracking-[0.18em] text-brand-forest hover:text-brand-forest-muted"
          >
            {email}
          </a>
        )}
      </div>
    </div>
  );
}
