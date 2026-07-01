import { cn } from "@/lib/utils";
import type { Contact, Tag } from "@/lib/crm/types";
import {
  contactDisplayName,
  statusLabel,
  sourceLabel,
} from "@/lib/crm/types";

export interface ContactListCardProps {
  contact: Contact;
  tags: Tag[];
  onClick?: () => void;
}

export default function ContactListCard({
  contact,
  tags,
  onClick,
}: ContactListCardProps) {
  const displayName = contactDisplayName(contact);
  const status = statusLabel(contact.status);
  const source = sourceLabel(contact.source);
  const contactTags = tags.filter((t) => (contact.tagIds ?? []).includes(t.id));

  const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.trim() || "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border border-admin-border-subtle bg-admin-surface p-4 text-left shadow-sm transition-colors",
        onClick && "hover:bg-admin-bg-subtle"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-admin-bg-subtle text-lg font-bold text-admin-primary">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-admin-fg-primary">{displayName}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              contact.status === "member" && "bg-admin-success/10 text-admin-success",
              contact.status === "volunteer" && "bg-purple-100 text-purple-700",
              contact.status === "lead" && "bg-blue-100 text-blue-700",
              contact.status === "subscriber" && "bg-yellow-100 text-yellow-700",
              contact.status === "sponsor" && "bg-orange-100 text-orange-700",
              contact.status === "alumni" && "bg-gray-100 text-gray-600",
              contact.status === "inactive" && "bg-red-100 text-admin-danger"
            )}
          >
            {status}
          </span>
        </div>
        {contact.email && (
          <p className="truncate text-sm text-admin-fg-secondary">{contact.email}</p>
        )}
        <p className="mt-1 text-xs text-admin-fg-muted">Source: {source}</p>
        {contactTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {contactTags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-admin-fg-primary"
                style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40` }}
              >
                {tag.name}
              </span>
            ))}
            {contactTags.length > 4 && (
              <span className="rounded-full px-2 py-0.5 text-xs text-admin-fg-muted">
                +{contactTags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
