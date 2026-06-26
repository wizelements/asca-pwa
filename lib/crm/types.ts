/**
 * ASCA Admin CRM — TypeScript type definitions
 * Stage 1B: mock-data foundation. No database schema changes.
 */

export type CrmContactType = "person" | "organization";

export type CrmStatus =
  | "lead"
  | "subscriber"
  | "member"
  | "volunteer"
  | "sponsor"
  | "alumni"
  | "inactive";

export type CrmSource =
  | "contact-form"
  | "event-updates"
  | "membership-form"
  | "volunteer-form"
  | "manual"
  | "jotform"
  | "rsvp"
  | "member-import";

export type CrmTagCategory =
  | "interest"
  | "role"
  | "source"
  | "status"
  | "committee"
  | "custom";

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export type NoteVisibility = "admin" | "sensitive";

export type RelatedEntityType =
  | "contact"
  | "member"
  | "submission"
  | "event"
  | "organization";

export type TimelineEventType =
  | "note_added"
  | "task_created"
  | "task_completed"
  | "submission_received"
  | "status_changed"
  | "tag_added"
  | "event_rsvp"
  | "communication_sent"
  | "ai_suggestion_viewed";

export interface Tag {
  id: number;
  name: string;
  color: string;
  category: CrmTagCategory;
  createdAt: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: CrmContactType;
  status: CrmStatus;
  source: CrmSource;
  bio?: string;
  photo?: string;
  isActive: boolean;
  memberId?: number;
  joinDate?: string;
  consentEmail: boolean;
  consentSms: boolean;
  tagIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberCrm {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  photo?: string;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  joinDate?: string;
  linkedContactId?: number;
}

export interface Organization {
  id: number;
  name: string;
  type: "sponsor" | "donor" | "venue" | "vendor" | "partner" | "other";
  contactPersonId?: number;
  email?: string;
  phone?: string;
  relationshipType: "active" | "prospect" | "former";
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  contactId?: number;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: number;
  authorId?: number;
  authorName?: string;
  body: string;
  visibility: NoteVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: number;
  assignedToName?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: number;
  dueDate?: string;
  completedAt?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: number;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: number;
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ContactFilters {
  query?: string;
  status?: CrmStatus | "";
  source?: CrmSource | "";
  tagId?: number | "";
}

export interface TaskFilters {
  query?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
}

export function contactDisplayName(contact: Contact): string {
  return (
    contact.displayName ||
    `${contact.firstName} ${contact.lastName}`.trim() ||
    contact.email ||
    "Unnamed contact"
  );
}

export function statusLabel(status: CrmStatus): string {
  const labels: Record<CrmStatus, string> = {
    lead: "Lead",
    subscriber: "Subscriber",
    member: "Member",
    volunteer: "Volunteer",
    sponsor: "Sponsor",
    alumni: "Alumni",
    inactive: "Inactive",
  };
  return labels[status] || status;
}

export function sourceLabel(source: CrmSource): string {
  const labels: Record<CrmSource, string> = {
    "contact-form": "Contact form",
    "event-updates": "Event updates form",
    "membership-form": "Membership form",
    "volunteer-form": "Volunteer form",
    manual: "Manual",
    jotform: "JotForm",
    rsvp: "Event RSVP",
    "member-import": "Member import",
  };
  return labels[source] || source;
}

export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    open: "Open",
    in_progress: "In progress",
    done: "Done",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export function priorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[priority] || priority;
}
