"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import { AiDraftBadge } from "@/components/crm";

export default function AiAssistantPage() {
  return (
    <>
      <AdminPageHeader
        title="AI Assistant"
        subtitle="Draft replies, summarize contacts, and get suggestions — only when an admin enables it."
      />

      <AiDraftBadge className="mb-6">
        <span className="block mt-1">
          AI is currently disabled. No data is sent to an AI provider.
        </span>
      </AiDraftBadge>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminSection title="What AI can help with">
          <ul className="space-y-3 text-sm text-admin-fg-secondary">
            <li className="flex items-start gap-2">
              <span>📝</span>
              <span>Summarize a contact&apos;s timeline into 2–3 sentences.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💡</span>
              <span>Suggest a next action based on status and recent activity.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✉️</span>
              <span>Draft a reply to a form submission for human review.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔖</span>
              <span>Suggest tags for a contact or event segment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📊</span>
              <span>Help prepare a simple board report from CRM data.</span>
            </li>
          </ul>
        </AdminSection>

        <AdminSection title="Safety rules">
          <ul className="space-y-3 text-sm text-admin-fg-secondary">
            <li className="flex items-start gap-2">
              <span className="font-bold text-admin-danger">✕</span>
              <span>AI will never send a message automatically.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-admin-danger">✕</span>
              <span>AI will never edit or delete CRM records.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-admin-danger">✕</span>
              <span>AI will not read notes marked sensitive.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-admin-danger">✕</span>
              <span>AI will not make membership, financial, or board decisions.</span>
            </li>
          </ul>
        </AdminSection>
      </div>
    </>
  );
}
