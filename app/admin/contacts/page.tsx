"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import { ContactListCard } from "@/components/crm";
import { getAdminToken, logout } from "@/components/AdminGuard";
import type { Contact, ContactSource, ContactStatus, ContactTag, ContactSummary } from "@/lib/crm/types";
import { mapContactForComponent, sourceLabel, statusLabel } from "@/lib/crm/types";

const STATUSES: ContactStatus[] = [
  "lead",
  "subscriber",
  "member",
  "volunteer",
  "sponsor",
  "alumni",
  "inactive",
];

const SOURCES: ContactSource[] = [
  "contact-form",
  "event-updates",
  "membership-form",
  "volunteer-form",
  "manual",
  "member-import",
  "rsvp",
];

interface ContactCreateForm {
  type: Contact["type"];
  firstName: string;
  lastName: string;
  organizationName: string;
  email: string;
  phone: string;
  source: ContactSource;
  status: ContactStatus;
  notesSummary: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | ContactStatus>("");
  const [source, setSource] = useState<"" | ContactSource>("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("viewer");
  const [form, setForm] = useState<ContactCreateForm>({
    type: "person",
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    phone: "",
    source: "manual",
    status: "lead",
    notesSummary: "",
  });

  useEffect(() => {
    fetchTags();
    fetchContacts();
  }, [query, status, source]);

  const fetchTags = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch("/api/admin/tags", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTags(Array.isArray(data.tags) ? data.tags : []);
      }
    } catch {
      // ignore tag errors
    }
  };

  const fetchContacts = async () => {
    const token = getAdminToken();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (status) params.set("status", status);
      if (source) params.set("source", source);
      const res = await fetch(`/api/admin/contacts?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError("Unable to load contacts.");
        return;
      }
      const data = await res.json();
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
      if (data.user?.role) setUserRole(data.user.role);
    } catch {
      setError("Unable to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = getAdminToken();
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          interests: [],
          consentEmail: false,
          consentSms: false,
          lifecycleStage: "awareness",
          isActive: true,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to create contact.");
        return;
      }
      setModalOpen(false);
      setForm({
        type: "person",
        firstName: "",
        lastName: "",
        organizationName: "",
        email: "",
        phone: "",
        source: "manual",
        status: "lead",
        notesSummary: "",
      });
      await fetchContacts();
    } catch {
      setError("Unable to create contact.");
    } finally {
      setSaving(false);
    }
  };

  const canAdd = userRole === "admin" || userRole === "editor";

  return (
    <>
      <AdminPageHeader
        title="Contacts"
        subtitle="Manage ASCA relationships — members, leads, volunteers, sponsors, and partners."
        primaryAction={
          canAdd ? (
            <AdminActionButton size="md" onClick={() => setModalOpen(true)}>
              + Add contact
            </AdminActionButton>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

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
              onChange={(e) => setStatus(e.target.value as "" | ContactStatus)}
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
              onChange={(e) => setSource(e.target.value as "" | ContactSource)}
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
        {loading ? (
          <div className="text-sm text-admin-fg-muted">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <AdminEmptyState
            icon="🤝"
            title="No contacts found"
            description="Try adjusting filters or add your first contact."
            action={canAdd ? { label: "Add contact", onClick: () => setModalOpen(true) } : undefined}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {contacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/admin/contacts/${contact.id}`}
                className="block"
              >
                <ContactListCard contact={mapContactForComponent(contact, contact.tags || [])} tags={tags} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-admin-surface p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-admin-fg-primary">Add Contact</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Contact["type"] })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  >
                    <option value="person">Person</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                {form.type === "person" ? (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">First name</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Last name</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Organization name</label>
                    <input
                      type="text"
                      value={form.organizationName}
                      onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                      className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value as ContactSource })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{sourceLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ContactStatus })}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-admin-fg-primary">Notes summary</label>
                  <textarea
                    value={form.notesSummary}
                    onChange={(e) => setForm({ ...form, notesSummary: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-admin-border-subtle bg-admin-bg-body px-4 py-2 text-admin-fg-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-admin-border-subtle px-6 py-2 text-admin-fg-primary hover:bg-admin-bg-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-admin-primary px-6 py-2 font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
