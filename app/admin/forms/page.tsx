"use client";

import { useEffect, useMemo, useState } from "react";

import { getAdminToken, logout } from "@/components/AdminGuard";
import type { ContactMessage } from "@/lib/crm/types";

const STATUS_OPTIONS: Array<{ value: "" | ContactMessage["status"]; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "resolved", label: "Resolved" },
];

const KNOWN_SOURCES = ["contact-form", "event-updates", "membership-form", "volunteer-form", "manual"];

function displaySource(type: string) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mailtoForMessage(message: ContactMessage) {
  const email = message.contact?.email;
  if (!email) return "";
  const subject = encodeURIComponent(`ASCA ${displaySource(message.sourcePage || "inquiry")} follow-up`);
  return `mailto:${email}?subject=${subject}`;
}

export default function AdminForms() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ContactMessage["status"]>("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("viewer");

  const sources = useMemo(() => {
    const types = new Set([...KNOWN_SOURCES, ...messages.map((m) => m.sourcePage || "")].filter(Boolean));
    return Array.from(types).sort();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter, statusFilter]);

  const fetchMessages = async () => {
    const token = getAdminToken();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (sourceFilter) params.set("sourcePage", sourceFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/contact-messages?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError("Unable to load messages.");
        return;
      }
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      try {
        const payload = JSON.parse(atob(token?.split(".")[1] || ""));
        setUserRole(payload.role || "viewer");
      } catch {
        setUserRole("viewer");
      }
    } catch {
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (msg: ContactMessage, status: ContactMessage["status"]) => {
    if (userRole !== "admin" && userRole !== "editor") return;
    const token = getAdminToken();
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/contact-messages/${msg.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Unable to update status.");
        return;
      }
      setMessage("Status updated.");
      setSelected((current) => (current?.id === data.id ? data : current));
      await fetchMessages();
    } catch {
      setError("Unable to update status.");
    }
  };

  const canWrite = userRole === "admin" || userRole === "editor";

  if (loading) return <div className="p-8">Loading messages...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Messages</h1>
          <p className="mt-1 text-sm text-brand-fg-secondary">Review and triage inquiries from the public site.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
          >
            <option value="">All sources</option>
            {sources.map((type) => (
              <option key={type} value={type}>{displaySource(type)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | ContactMessage["status"])}
            className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value || "all"} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-brand-border-subtle bg-brand-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-brand-border-subtle bg-brand-bg-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Submitted By</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Source</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-fg-muted">
                    No messages match the current filters.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => {
                  const name = msg.contact
                    ? `${msg.contact.firstName || ""} ${msg.contact.lastName || ""}`.trim() || "Website visitor"
                    : "Website visitor";
                  return (
                    <tr key={msg.id} className="border-b border-brand-border-subtle last:border-0 hover:bg-brand-bg-soft">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-brand-fg-primary">{name}</p>
                        <p className="text-sm text-brand-fg-secondary">{msg.contact?.email || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-fg-secondary">{displaySource(msg.sourcePage || msg.status)}</td>
                      <td className="px-6 py-4 text-sm text-brand-fg-secondary">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {canWrite ? (
                          <select
                            value={msg.status}
                            onChange={(e) => updateStatus(msg, e.target.value as ContactMessage["status"])}
                            className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-3 py-1 text-sm text-brand-fg-primary"
                          >
                            <option value="new">New</option>
                            <option value="replied">Replied</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        ) : (
                          <span className="text-sm capitalize text-brand-fg-secondary">{msg.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelected(msg)} className="rounded-lg bg-brand-forest px-3 py-1 text-sm text-white hover:bg-brand-forest-muted">
                          View
                        </button>
                        {msg.contact?.email && (
                          <a href={mailtoForMessage(msg)} className="ml-2 rounded-lg border border-brand-border-subtle px-3 py-1 text-sm text-brand-fg-primary hover:bg-brand-bg-subtle">
                            Email
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-brand-bg-elevated p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-fg-primary">Message Details</h2>
                <p className="mt-1 text-sm text-brand-fg-secondary">{displaySource(selected.sourcePage || "inquiry")} · {selected.status}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg border border-brand-border-subtle px-3 py-1 text-sm text-brand-fg-primary hover:bg-brand-bg-subtle">
                Close
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-brand-border-subtle bg-brand-bg-subtle p-4">
              <p className="text-sm font-semibold text-brand-fg-primary">{selected.subject || "No subject"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-brand-fg-secondary">{selected.message || "-"}</p>
              {selected.contact?.email && (
                <p className="mt-2 text-sm text-brand-fg-secondary">From: {selected.contact.email}</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {selected.contact?.email && (
                <a href={mailtoForMessage(selected)} className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
                  Email Submitter
                </a>
              )}
              {canWrite && (
                <>
                  <button onClick={() => updateStatus(selected, "replied")} className="rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">Mark Replied</button>
                  <button onClick={() => updateStatus(selected, "resolved")} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-accent-muted">Mark Resolved</button>
                </>
              )}
              {selected.contact && (
                <a
                  href={`/admin/contacts/${selected.contact.id}`}
                  className="rounded-lg border border-brand-forest px-4 py-2 text-sm font-semibold text-brand-forest hover:bg-brand-bg-soft"
                >
                  View contact
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
