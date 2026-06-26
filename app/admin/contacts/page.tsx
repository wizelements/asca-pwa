"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import { ContactListCard } from "@/components/crm";
import {
  getMockContacts,
  getMockTags,
  MOCK_CONTACTS,
} from "@/lib/crm/mock-data";
import type { CrmSource, CrmStatus } from "@/lib/crm/types";
import { sourceLabel, statusLabel } from "@/lib/crm/types";

const STATUSES: CrmStatus[] = [
  "lead",
  "subscriber",
  "member",
  "volunteer",
  "sponsor",
  "alumni",
  "inactive",
];

const SOURCES: CrmSource[] = [
  "contact-form",
  "event-updates",
  "membership-form",
  "volunteer-form",
  "manual",
  "jotform",
  "rsvp",
  "member-import",
];

export default function ContactsPage() {
  const tags = useMemo(() => getMockTags(), []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | CrmStatus>("");
  const [source, setSource] = useState<"" | CrmSource>("");

  const contacts = useMemo(
    () => getMockContacts({ query, status, source }),
    [query, status, source]
  );

  return (
    <>
      <AdminPageHeader
        title="Contacts"
        subtitle="Manage ASCA relationships — members, leads, volunteers, sponsors, and partners."
        primaryAction={
          <AdminActionButton size="md">+ Add contact</AdminActionButton>
        }
      />

      <AdminSection title="Filters">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Search</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, email, or phone"
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | CrmStatus)}
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-admin-fg-muted">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as "" | CrmSource)}
              className="mt-1 w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
            >
              <option value="">All sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{sourceLabel(s)}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminSection>

      <div className="mt-6">
        {contacts.length === 0 ? (
          <AdminEmptyState
            icon="🤝"
            title="No contacts found"
            description="Try adjusting filters or add your first contact."
            action={{ label: "Add contact" }}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {contacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/admin/contacts/${contact.id}`}
                className="block"
              >
                <ContactListCard contact={contact} tags={tags} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-admin-fg-muted">
        Showing demo contacts for foundation preview. Data is not persisted yet.
      </p>
    </>
  );
}
