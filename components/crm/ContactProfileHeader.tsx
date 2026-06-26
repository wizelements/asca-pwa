import { cn } from "@/lib/utils";
import type { Contact, Tag } from "@/lib/crm/types";
import { contactDisplayName, statusLabel, sourceLabel } from "@/lib/crm/types";

export interface ContactProfileHeaderProps {
  contact: Contact;
  tags: Tag[];
}

export default function ContactProfileHeader({
  contact,
  tags,
}: ContactProfileHeaderProps) {
  const displayName = contactDisplayName(contact);
  const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.trim() || "?";
  const contactTags = tags.filter((t) => contact.tagIds.includes(t.id));

  return (
    <div className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-4 md:items-center md:gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-admin-bg-subtle text-2xl font-bold text-admin-primary md:h-20 md:w-20">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-admin-fg-primary md:text-3xl">{displayName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-admin-fg-secondary">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                contact.status === "member" && "bg-admin-success/10 text-admin-success",
                contact.status === "volunteer" && "bg-purple-100 text-purple-700",
                contact.status === "lead" && "bg-blue-100 text-blue-700",
                contact.status === "subscriber" && "bg-yellow-100 text-yellow-700",
                contact.status === "sponsor" && "bg-orange-100 text-orange-700",
                contact.status === "alumni" && "bg-gray-100 text-gray-600",
                contact.status === "inactive" && "bg-red-100 text-admin-danger"
              )}
            >
              {statusLabel(contact.status)}
            </span>
            <span className="text-admin-fg-muted">•</span>
            <span>{sourceLabel(contact.source)}</span>
          </div>
          <div className="mt-3 grid gap-1 text-sm md:grid-cols-2">
            {contact.email && (
              <p className="truncate text-admin-fg-secondary">
                <span className="text-admin-fg-muted">Email:</span> {contact.email}
              </p>
            )}
            {contact.phone && (
              <p className="text-admin-fg-secondary">
                <span className="text-admin-fg-muted">Phone:</span> {contact.phone}
              </p>
            )}
            {contact.joinDate && (
              <p className="text-admin-fg-secondary">
                <span className="text-admin-fg-muted">Joined:</span> {contact.joinDate}
              </p>
            )}
            {contact.memberId && (
              <p className="text-admin-fg-secondary">
                <span className="text-admin-fg-muted">Member ID:</span> #{contact.memberId}
              </p>
            )}
          </div>
          {contact.bio && (
            <p className="mt-3 max-w-2xl text-sm text-admin-fg-secondary">{contact.bio}</p>
          )}
          {contactTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contactTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-admin-fg-primary"
                  style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40` }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
