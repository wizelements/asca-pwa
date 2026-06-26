/**
 * ASCA Admin CRM — DEMO / MOCK DATA
 * This file provides sample data for Stage 1B UI development only.
 * It must be replaced by real database queries in Stage 1C.
 * No production or private data is stored here.
 */

import type {
  Contact,
  CrmSource,
  CrmStatus,
  MemberCrm,
  Note,
  Organization,
  Tag,
  Task,
  TimelineEvent,
} from "./types";

export const MOCK_TAGS: Tag[] = [
  { id: 1, name: "trail-rides", color: "#1f6b3a", category: "interest", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "monthly-meetings", color: "#2f7c4c", category: "interest", createdAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "community-events", color: "#d97706", category: "interest", createdAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "membership", color: "#1f6b3a", category: "interest", createdAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "volunteering", color: "#7c3aed", category: "interest", createdAt: "2024-01-01T00:00:00Z" },
  { id: 6, name: "officer", color: "#dc2626", category: "role", createdAt: "2024-01-01T00:00:00Z" },
  { id: 7, name: "instructor", color: "#2563eb", category: "role", createdAt: "2024-01-01T00:00:00Z" },
  { id: 8, name: "member", color: "#1f6b3a", category: "role", createdAt: "2024-01-01T00:00:00Z" },
  { id: 9, name: "prospect", color: "#737373", category: "status", createdAt: "2024-01-01T00:00:00Z" },
  { id: 10, name: "contact-form", color: "#0891b2", category: "source", createdAt: "2024-01-01T00:00:00Z" },
  { id: 11, name: "event-updates", color: "#0891b2", category: "source", createdAt: "2024-01-01T00:00:00Z" },
  { id: 12, name: "manual", color: "#4b5563", category: "source", createdAt: "2024-01-01T00:00:00Z" },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Jennings",
    displayName: "",
    email: "sarah.j@example.com",
    phone: "(404) 555-0101",
    type: "person",
    status: "member",
    source: "manual",
    bio: "Lifelong rider and ASCA board secretary. Owns two quarter horses.",
    isActive: true,
    memberId: 1,
    joinDate: "2021-03-15",
    consentEmail: true,
    consentSms: false,
    tagIds: [8, 6, 2, 5],
    createdAt: "2021-03-15T10:00:00Z",
    updatedAt: "2026-06-20T14:00:00Z",
  },
  {
    id: 2,
    firstName: "Marcus",
    lastName: "Delgado",
    displayName: "",
    email: "marcus.d@example.com",
    phone: "(404) 555-0102",
    type: "person",
    status: "volunteer",
    source: "volunteer-form",
    bio: "Event setup volunteer. Interested in community outreach.",
    isActive: true,
    joinDate: "2025-01-10",
    consentEmail: true,
    consentSms: false,
    tagIds: [5, 3, 11],
    createdAt: "2025-01-10T09:30:00Z",
    updatedAt: "2026-06-22T11:20:00Z",
  },
  {
    id: 3,
    firstName: "Elena",
    lastName: "Rossi",
    displayName: "",
    email: "elena.r@example.com",
    phone: "",
    type: "person",
    status: "lead",
    source: "contact-form",
    bio: "Asked about membership requirements via website contact form.",
    isActive: true,
    consentEmail: false,
    consentSms: false,
    tagIds: [9, 4, 10],
    createdAt: "2026-06-18T16:45:00Z",
    updatedAt: "2026-06-18T16:45:00Z",
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Chen",
    displayName: "",
    email: "david.c@example.com",
    phone: "(404) 555-0103",
    type: "person",
    status: "subscriber",
    source: "event-updates",
    bio: "Wants to stay informed about trail rides and clinics.",
    isActive: true,
    consentEmail: true,
    consentSms: false,
    tagIds: [1, 11],
    createdAt: "2024-08-05T08:15:00Z",
    updatedAt: "2026-06-15T10:00:00Z",
  },
  {
    id: 5,
    firstName: "Angela",
    lastName: "Brooks",
    displayName: "",
    email: "angela.b@example.com",
    phone: "(404) 555-0104",
    type: "person",
    status: "member",
    source: "manual",
    bio: "Treasurer. English riding background.",
    isActive: true,
    memberId: 2,
    joinDate: "2020-06-01",
    consentEmail: true,
    consentSms: false,
    tagIds: [8, 6, 2],
    createdAt: "2020-06-01T12:00:00Z",
    updatedAt: "2026-06-10T09:00:00Z",
  },
  {
    id: 6,
    firstName: "Trail Creek Saddlery",
    lastName: "",
    displayName: "Trail Creek Saddlery",
    email: "partners@trailcreek.example.com",
    phone: "(404) 555-0200",
    type: "organization",
    status: "sponsor",
    source: "manual",
    bio: "Local tack shop sponsor for annual show.",
    isActive: true,
    consentEmail: false,
    consentSms: false,
    tagIds: [12],
    createdAt: "2023-04-20T13:00:00Z",
    updatedAt: "2026-05-01T11:00:00Z",
  },
];

export const MOCK_MEMBERS: MemberCrm[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Jennings",
    email: "sarah.j@example.com",
    bio: "Lifelong rider and ASCA board secretary. Owns two quarter horses.",
    roles: ["secretary", "instructor"],
    isActive: true,
    isVerified: true,
    joinDate: "2021-03-15",
    linkedContactId: 1,
  },
  {
    id: 2,
    firstName: "Angela",
    lastName: "Brooks",
    email: "angela.b@example.com",
    bio: "Treasurer. English riding background.",
    roles: ["treasurer"],
    isActive: true,
    isVerified: true,
    joinDate: "2020-06-01",
    linkedContactId: 5,
  },
];

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    name: "Trail Creek Saddlery",
    type: "sponsor",
    contactPersonId: 6,
    email: "partners@trailcreek.example.com",
    phone: "(404) 555-0200",
    relationshipType: "active",
    notes: "Sponsors the annual spring show. Renew annually in March.",
    tags: ["sponsor", "spring-show"],
    createdAt: "2023-04-20T13:00:00Z",
    updatedAt: "2026-05-01T11:00:00Z",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 101,
    title: "Follow up with Elena about membership",
    description: "Send membership packet and answer questions about dues.",
    status: "open",
    priority: "high",
    assignedTo: 1,
    assignedToName: "Sarah Jennings",
    relatedEntityType: "contact",
    relatedEntityId: 3,
    dueDate: "2026-06-28",
    createdBy: 1,
    createdByName: "Sarah Jennings",
    createdAt: "2026-06-20T10:00:00Z",
    updatedAt: "2026-06-20T10:00:00Z",
  },
  {
    id: 102,
    title: "Confirm Marcus volunteer shift for June clinic",
    description: "He signed up via volunteer form. Need to confirm time slot.",
    status: "in_progress",
    priority: "medium",
    assignedTo: 1,
    assignedToName: "Sarah Jennings",
    relatedEntityType: "contact",
    relatedEntityId: 2,
    dueDate: "2026-06-27",
    createdBy: 1,
    createdByName: "Sarah Jennings",
    createdAt: "2026-06-19T09:00:00Z",
    updatedAt: "2026-06-21T12:00:00Z",
  },
  {
    id: 103,
    title: "Send sponsor thank-you to Trail Creek Saddlery",
    description: "Draft and send post-event thank-you email.",
    status: "open",
    priority: "medium",
    assignedTo: 2,
    assignedToName: "Angela Brooks",
    relatedEntityType: "contact",
    relatedEntityId: 6,
    dueDate: "2026-06-30",
    createdBy: 2,
    createdByName: "Angela Brooks",
    createdAt: "2026-06-15T14:00:00Z",
    updatedAt: "2026-06-15T14:00:00Z",
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: 1001,
    contactId: 1,
    relatedEntityType: "contact",
    relatedEntityId: 1,
    authorId: 1,
    authorName: "Sarah Jennings",
    body: "Updated bio photo. Also interested in hosting a clinic.",
    visibility: "admin",
    createdAt: "2026-06-20T14:00:00Z",
    updatedAt: "2026-06-20T14:00:00Z",
  },
  {
    id: 1002,
    contactId: 3,
    relatedEntityType: "contact",
    relatedEntityId: 3,
    authorId: 1,
    authorName: "Sarah Jennings",
    body: "Called Elena on 6/19 and left voicemail. Follow up by email.",
    visibility: "admin",
    createdAt: "2026-06-19T17:00:00Z",
    updatedAt: "2026-06-19T17:00:00Z",
  },
  {
    id: 1003,
    contactId: 5,
    relatedEntityType: "contact",
    relatedEntityId: 5,
    authorId: 2,
    authorName: "Angela Brooks",
    body: "Discussed budget for fall event. Prefer not to detail finances here.",
    visibility: "sensitive",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-10T09:00:00Z",
  },
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 5001,
    relatedEntityType: "contact",
    relatedEntityId: 1,
    type: "note_added",
    title: "Note added by Sarah Jennings",
    description: "Updated bio photo. Also interested in hosting a clinic.",
    metadata: { noteId: 1001 },
    createdAt: "2026-06-20T14:00:00Z",
  },
  {
    id: 5002,
    relatedEntityType: "contact",
    relatedEntityId: 3,
    type: "submission_received",
    title: "Website contact form submitted",
    description: "Asked about membership requirements.",
    metadata: { submissionId: 123 },
    createdAt: "2026-06-18T16:45:00Z",
  },
  {
    id: 5003,
    relatedEntityType: "contact",
    relatedEntityId: 3,
    type: "task_created",
    title: "Task created: Follow up with Elena about membership",
    metadata: { taskId: 101 },
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: 5004,
    relatedEntityType: "contact",
    relatedEntityId: 2,
    type: "tag_added",
    title: "Tagged as volunteer and community-events",
    metadata: { tags: ["volunteering", "community-events"] },
    createdAt: "2026-06-22T11:20:00Z",
  },
];

export function getMockTags(): Tag[] {
  return [...MOCK_TAGS];
}

export function getMockContacts(filters?: {
  query?: string;
  status?: string;
  source?: string;
  tagId?: number | string;
}): Contact[] {
  let result = [...MOCK_CONTACTS];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters?.status) {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.source) {
    result = result.filter((c) => c.source === filters.source);
  }
  if (filters?.tagId !== undefined && filters.tagId !== "") {
    const tagId = Number(filters.tagId);
    result = result.filter((c) => c.tagIds.includes(tagId));
  }
  return result.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export function getMockContactById(id: number | string): Contact | undefined {
  return MOCK_CONTACTS.find((c) => c.id === Number(id));
}

export function getMockTasks(filters?: {
  query?: string;
  status?: string;
  priority?: string;
}): Task[] {
  let result = [...MOCK_TASKS];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters?.status) {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.priority) {
    result = result.filter((t) => t.priority === filters.priority);
  }
  return result.sort(
    (a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
  );
}

export function getMockNotesForContact(contactId: number): Note[] {
  return MOCK_NOTES.filter(
    (n) => n.contactId === contactId || (n.relatedEntityType === "contact" && n.relatedEntityId === contactId)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockTimelineForContact(contactId: number): TimelineEvent[] {
  return MOCK_TIMELINE.filter(
    (e) => e.relatedEntityType === "contact" && e.relatedEntityId === contactId
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockTagById(id: number): Tag | undefined {
  return MOCK_TAGS.find((t) => t.id === id);
}
