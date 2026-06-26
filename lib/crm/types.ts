export type ContactType = 'person' | 'organization';
export type ContactSource =
  | 'contact-form'
  | 'event-updates'
  | 'membership-form'
  | 'volunteer-form'
  | 'manual'
  | 'member-import'
  | 'rsvp'
  | 'jotform';
export type CrmSource = ContactSource;
export type ContactStatus =
  | 'lead'
  | 'subscriber'
  | 'member'
  | 'volunteer'
  | 'sponsor'
  | 'alumni'
  | 'inactive';
export type CrmStatus = ContactStatus;
export type LifecycleStage =
  | 'awareness'
  | 'engaged'
  | 'member'
  | 'volunteer'
  | 'advocate'
  | 'inactive';
export type MessageStatus = 'new' | 'replied' | 'resolved';
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type NoteVisibility = 'admin' | 'sensitive';
export type TagCategory = 'interest' | 'role' | 'source' | 'status' | 'committee' | 'custom';
export type ActivityType =
  | 'contact_created'
  | 'contact_updated'
  | 'message_received'
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'status_changed'
  | 'lifecycle_changed'
  | 'tag_added'
  | 'tag_removed'
  | 'ai_suggestion_viewed';

export interface Contact {
  id: number;
  type: ContactType;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
  source: ContactSource;
  status: ContactStatus;
  lifecycleStage: LifecycleStage;
  interests: string[];
  consentEmail: boolean;
  consentSms: boolean;
  notesSummary?: string;
  bio?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  joinDate?: string;
  memberId?: number;
  tagIds?: number[];
}

export interface ContactSummary extends Contact {
  tags?: ContactTag[];
  messageCount?: number;
  taskCount?: number;
  lastActivityAt?: Date;
}

export interface ContactMessage {
  id: number;
  contactId: number;
  formSubmissionId?: number;
  subject?: string;
  message?: string;
  body?: string;
  sourcePage?: string;
  status: MessageStatus;
  assignedTo?: number;
  assignedToName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  contact?: Contact;
}

export interface ContactNote {
  id: number;
  contactId: number;
  authorAdminId?: number;
  authorId?: number; // legacy alias
  authorName?: string;
  note: string;
  body?: string;
  visibility: NoteVisibility;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  relatedEntityType?: 'contact' | 'member';
  relatedEntityId?: number;
}

export type Note = ContactNote;

export interface ContactTask {
  id: number;
  contactId: number;
  title: string;
  description?: string;
  dueDate?: Date | string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: number;
  assignedToName?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  relatedEntityType?: 'contact' | 'member';
  relatedEntityId?: number;
  completedAt?: string;
}

export type Task = ContactTask;

export interface ContactTag {
  id: number;
  name: string;
  color: string;
  category: TagCategory;
  createdAt?: Date | string;
}

export type Tag = ContactTag;

export interface ContactActivity {
  id: number;
  contactId: number;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  createdAt?: Date | string;
  relatedEntityType?: 'contact' | 'member';
  relatedEntityId?: number;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: 'contact' | 'member';
  relatedEntityId?: number;
}

export type TimelineEventType =
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'submission_received'
  | 'status_changed'
  | 'tag_added'
  | 'event_rsvp'
  | 'communication_sent'
  | 'ai_suggestion_viewed';

export interface ContactWithRelations {
  contact: Contact;
  tags: Tag[];
  messages: ContactMessage[];
  notes: Note[];
  tasks: Task[];
  activities: ContactActivity[];
}

export interface CrmDashboardStats {
  totalContacts: number;
  activeMembers: number;
  newMessages: number;
  openTasks: number;
}

// Legacy mock-only types
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
  type: string;
  contactPersonId?: number;
  email?: string;
  phone?: string;
  relationshipType?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Display helpers

export function contactDisplayName(contact: Contact): string {
  if (contact.displayName) return contact.displayName;
  if (contact.type === 'organization') {
    return contact.organizationName || contact.email || `Organization #${contact.id}`;
  }
  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return contact.email || `Contact #${contact.id}`;
}

export function statusLabel(status: ContactStatus): string {
  const labels: Record<ContactStatus, string> = {
    lead: 'Lead',
    subscriber: 'Subscriber',
    member: 'Member',
    volunteer: 'Volunteer',
    sponsor: 'Sponsor',
    alumni: 'Alumni',
    inactive: 'Inactive',
  };
  return labels[status] || status;
}

export function sourceLabel(source: ContactSource): string {
  const labels: Record<ContactSource, string> = {
    'contact-form': 'Contact form',
    'event-updates': 'Event updates',
    'membership-form': 'Membership form',
    'volunteer-form': 'Volunteer form',
    manual: 'Manual',
    'member-import': 'Member import',
    rsvp: 'Event RSVP',
    jotform: 'JotForm',
  };
  return labels[source] || source;
}

export function lifecycleLabel(stage: LifecycleStage): string {
  const labels: Record<LifecycleStage, string> = {
    awareness: 'Awareness',
    engaged: 'Engaged',
    member: 'Member',
    volunteer: 'Volunteer',
    advocate: 'Advocate',
    inactive: 'Inactive',
  };
  return labels[stage] || stage;
}

export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    open: 'Open',
    in_progress: 'In progress',
    done: 'Done',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function messageStatusLabel(status: MessageStatus): string {
  const labels: Record<MessageStatus, string> = {
    new: 'New',
    replied: 'Replied',
    resolved: 'Resolved',
  };
  return labels[status] || status;
}

export function priorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };
  return labels[priority] || priority;
}

export function noteVisibilityLabel(visibility: NoteVisibility): string {
  return visibility === 'sensitive' ? 'Sensitive (admin/editor only)' : 'Admin visible';
}

export function toIsoString(date?: Date | string): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  try {
    return date.toISOString();
  } catch {
    return undefined;
  }
}

export function mapActivityToTimelineEvent(activity: ContactActivity): TimelineEvent {
  const typeMap: Record<ActivityType, TimelineEventType> = {
    note_added: 'note_added',
    task_created: 'task_created',
    task_completed: 'task_completed',
    message_received: 'submission_received',
    status_changed: 'status_changed',
    lifecycle_changed: 'status_changed',
    tag_added: 'tag_added',
    tag_removed: 'tag_added',
    contact_created: 'submission_received',
    contact_updated: 'communication_sent',
    ai_suggestion_viewed: 'ai_suggestion_viewed',
  };
  return {
    id: String(activity.id),
    type: typeMap[activity.activityType] || 'communication_sent',
    title: activity.title,
    description: activity.description,
    createdAt: toIsoString(activity.createdAt) || new Date().toISOString(),
    metadata: activity.metadata,
    relatedEntityType: activity.relatedEntityType,
    relatedEntityId: activity.relatedEntityId,
  };
}

export function mapNoteForComponent(note: ContactNote): Note {
  return { ...note, body: note.note };
}

export function mapTaskForComponent(task: ContactTask): Task {
  return {
    ...task,
    relatedEntityType: 'contact',
    relatedEntityId: task.contactId,
    dueDate: toIsoString(task.dueDate),
    completedAt: task.status === 'done' ? toIsoString(task.updatedAt) : undefined,
  };
}

export function mapContactForComponent(contact: Contact, tags?: ContactTag[]): Contact {
  return {
    ...contact,
    tagIds: tags?.map((t) => t.id) || contact.tagIds || [],
    bio: contact.bio || contact.notesSummary,
    joinDate: contact.joinDate || toIsoString(contact.createdAt),
  };
}
