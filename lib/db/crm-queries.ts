import { getDb } from '@/lib/db';

import type {
  Contact,
  ContactSummary,
  ContactMessage,
  ContactNote,
  ContactTask,
  ContactTag,
  ContactActivity,
  ContactWithRelations,
  ContactType,
  ContactSource,
  ContactStatus,
  LifecycleStage,
  MessageStatus,
  TaskStatus,
  TaskPriority,
  NoteVisibility,
  TagCategory,
  ActivityType,
} from '@/lib/crm/types';

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToContact(row: any): Contact {
  return {
    id: row.id,
    type: (row.type as ContactType) || 'person',
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    organizationName: row.organization_name || undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
    source: (row.source as ContactSource) || 'manual',
    status: (row.status as ContactStatus) || 'lead',
    lifecycleStage: (row.lifecycle_stage as LifecycleStage) || 'awareness',
    interests: parseJson<string[]>(row.interests, []),
    consentEmail: Boolean(row.consent_email),
    consentSms: Boolean(row.consent_sms),
    notesSummary: row.notes_summary || undefined,
    isActive: row.is_active === undefined ? true : Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToContactMessage(row: any): ContactMessage {
  return {
    id: row.id,
    contactId: row.contact_id,
    formSubmissionId: row.form_submission_id || undefined,
    subject: row.subject || undefined,
    message: row.message || undefined,
    sourcePage: row.source_page || undefined,
    status: (row.status as MessageStatus) || 'new',
    assignedTo: row.assigned_to || undefined,
    assignedToName: row.assigned_to_name || undefined,
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToContactNote(row: any): ContactNote {
  return {
    id: row.id,
    contactId: row.contact_id,
    authorAdminId: row.author_admin_id,
    authorName: row.author_name || undefined,
    note: row.note,
    visibility: (row.visibility as NoteVisibility) || 'admin',
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
  };
}

function rowToContactTask(row: any): ContactTask {
  return {
    id: row.id,
    contactId: row.contact_id,
    title: row.title,
    description: row.description || undefined,
    dueDate: row.due_date ? new Date(row.due_date * 1000) : undefined,
    status: (row.status as TaskStatus) || 'open',
    priority: (row.priority as TaskPriority) || 'medium',
    assignedTo: row.assigned_to || undefined,
    assignedToName: row.assigned_to_name || undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name || undefined,
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToContactTag(row: any): ContactTag {
  return {
    id: row.id,
    name: row.name,
    color: row.color || '#737373',
    category: (row.category as TagCategory) || 'custom',
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
  };
}

function rowToContactActivity(row: any): ContactActivity {
  return {
    id: row.id,
    contactId: row.contact_id,
    activityType: (row.activity_type as ActivityType) || 'contact_created',
    title: row.title,
    description: row.description || undefined,
    metadata: parseJson<Record<string, unknown>>(row.metadata, {}),
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
  };
}

function dateToSeconds(date?: Date | string): number | null {
  if (!date) return null;
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return Math.floor(parsed.getTime() / 1000);
}

function contactSearchClause(q?: string): { sql: string; args: (string | number)[] } {
  if (!q || !q.trim()) return { sql: '', args: [] };
  const term = `%${q.trim().toLowerCase()}%`;
  return {
    sql: `AND (lower(coalesce(first_name,'')) LIKE ? OR lower(coalesce(last_name,'')) LIKE ? OR lower(coalesce(organization_name,'')) LIKE ? OR lower(coalesce(email,'')) LIKE ? OR lower(coalesce(phone,'')) LIKE ?)`,
    args: [term, term, term, term, term],
  };
}

export async function getContacts(options: {
  q?: string;
  status?: ContactStatus;
  source?: ContactSource;
  lifecycleStage?: LifecycleStage;
  tagId?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<{ contacts: ContactSummary[]; total: number }> {
  const db = getDb();
  const search = contactSearchClause(options.q);
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  let where = 'WHERE 1=1';
  const args: (string | number)[] = [];
  if (options.status) {
    where += ' AND status = ?';
    args.push(options.status);
  }
  if (options.source) {
    where += ' AND source = ?';
    args.push(options.source);
  }
  if (options.lifecycleStage) {
    where += ' AND lifecycle_stage = ?';
    args.push(options.lifecycleStage);
  }
  if (options.tagId) {
    where += ' AND c.id IN (SELECT contact_id FROM contact_tag_assignments WHERE tag_id = ?)';
    args.push(options.tagId);
  }

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as c FROM contacts c ${where} ${search.sql}`,
    args: [...args, ...search.args],
  });
  const total = Number(countResult.rows[0]?.c ?? 0);

  const result = await db.execute({
    sql: `
      SELECT c.*, COUNT(DISTINCT m.id) as message_count, COUNT(DISTINCT t.id) as task_count, MAX(a.created_at) as last_activity_at
      FROM contacts c
      LEFT JOIN contact_messages m ON m.contact_id = c.id
      LEFT JOIN contact_tasks t ON t.contact_id = c.id AND t.status != 'done'
      LEFT JOIN contact_activities a ON a.contact_id = c.id
      ${where} ${search.sql}
      GROUP BY c.id
      ORDER BY last_activity_at DESC NULLS LAST, c.updated_at DESC, c.id DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, ...search.args, limit, offset],
  });

  const contacts = result.rows.map((row: any) => {
    const contact = rowToContact(row);
    return {
      ...contact,
      messageCount: Number(row.message_count ?? 0),
      taskCount: Number(row.task_count ?? 0),
      lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at * 1000) : undefined,
    };
  });

  return { contacts, total };
}

export async function getContactById(id: number): Promise<Contact | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM contacts WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToContact(result.rows[0]);
}

export async function getContactByEmail(email: string): Promise<Contact | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM contacts WHERE lower(email) = ? ORDER BY updated_at DESC LIMIT 1',
    args: [email.toLowerCase().trim()],
  });
  if (result.rows.length === 0) return null;
  return rowToContact(result.rows[0]);
}

export async function createContact(
  data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Contact> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contacts (type, first_name, last_name, organization_name, email, phone, source, status, lifecycle_stage, interests, consent_email, consent_sms, notes_summary, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.type || 'person',
      data.firstName ?? null,
      data.lastName ?? null,
      data.organizationName ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.source || 'manual',
      data.status || 'lead',
      data.lifecycleStage || 'awareness',
      JSON.stringify(data.interests || []),
      Number(data.consentEmail),
      Number(data.consentSms),
      data.notesSummary ?? null,
      Number(data.isActive !== false),
    ],
  });
  const id = Number(result.lastInsertRowid);
  await createContactActivity(id, 'contact_created', 'Contact created', undefined, { source: data.source });
  return (await getContactById(id))!;
}

export async function updateContact(
  id: number,
  data: Partial<Contact>
): Promise<Contact | null> {
  const db = getDb();
  const existing = await getContactById(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };

  await db.execute({
    sql: `UPDATE contacts SET
      type = ?, first_name = ?, last_name = ?, organization_name = ?, email = ?, phone = ?, source = ?, status = ?, lifecycle_stage = ?, interests = ?, consent_email = ?, consent_sms = ?, notes_summary = ?, is_active = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [
      merged.type,
      merged.firstName ?? null,
      merged.lastName ?? null,
      merged.organizationName ?? null,
      merged.email ?? null,
      merged.phone ?? null,
      merged.source,
      merged.status,
      merged.lifecycleStage,
      JSON.stringify(merged.interests || []),
      Number(merged.consentEmail),
      Number(merged.consentSms),
      merged.notesSummary ?? null,
      Number(merged.isActive !== false),
      id,
    ],
  });

  const metadata: Record<string, unknown> = {};
  if (data.status && data.status !== existing.status) {
    metadata.oldStatus = existing.status;
    metadata.newStatus = data.status;
    await createContactActivity(id, 'status_changed', `Status changed to ${data.status}`, undefined, metadata);
  }
  if (data.lifecycleStage && data.lifecycleStage !== existing.lifecycleStage) {
    metadata.oldStage = existing.lifecycleStage;
    metadata.newStage = data.lifecycleStage;
    await createContactActivity(id, 'lifecycle_changed', `Lifecycle changed to ${data.lifecycleStage}`, undefined, metadata);
  }
  if (Object.keys(data).length > 0 && !metadata.newStatus && !metadata.newStage) {
    await createContactActivity(id, 'contact_updated', 'Contact updated', undefined, { fields: Object.keys(data) });
  }

  return getContactById(id);
}

export async function getContactWithRelations(id: number): Promise<ContactWithRelations | null> {
  const [contact, tags, messages, notes, tasks, activities] = await Promise.all([
    getContactById(id),
    getTagsForContact(id),
    getMessagesForContact(id),
    getNotesForContact(id),
    getTasksForContact(id),
    getActivitiesForContact(id),
  ]);
  if (!contact) return null;
  return { contact, tags, messages, notes, tasks, activities };
}

export async function getMessagesForContact(contactId: number): Promise<ContactMessage[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT m.*, u.name as assigned_to_name
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to
      WHERE m.contact_id = ?
      ORDER BY m.created_at DESC, m.id DESC
    `,
    args: [contactId],
  });
  return result.rows.map(rowToContactMessage);
}

export async function getMessageById(id: number): Promise<ContactMessage | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT m.*, u.name as assigned_to_name
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to
      WHERE m.id = ?
    `,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToContactMessage(result.rows[0]);
}

export async function createContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ContactMessage> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contact_messages (contact_id, form_submission_id, subject, message, source_page, status, assigned_to, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.contactId,
      data.formSubmissionId ?? null,
      data.subject ?? null,
      data.message ?? null,
      data.sourcePage ?? null,
      data.status || 'new',
      data.assignedTo ?? null,
    ],
  });
  const id = Number(result.lastInsertRowid);
  await createContactActivity(data.contactId, 'message_received', data.subject || 'New message received', data.message, { messageId: id });
  return (await getMessageById(id))!;
}

export async function updateContactMessage(
  id: number,
  data: Partial<ContactMessage>
): Promise<ContactMessage | null> {
  const db = getDb();
  const existing = await getMessageById(id);
  if (!existing) return null;

  await db.execute({
    sql: `UPDATE contact_messages SET
      status = ?, assigned_to = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [data.status ?? existing.status, data.assignedTo ?? existing.assignedTo ?? null, id],
  });

  return getMessageById(id);
}

export async function getMessages(options: {
  status?: MessageStatus;
  sourcePage?: string;
  assignedTo?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<{ messages: ContactMessage[]; total: number }> {
  const db = getDb();
  let where = 'WHERE 1=1';
  const args: (string | number)[] = [];
  if (options.status) {
    where += ' AND m.status = ?';
    args.push(options.status);
  }
  if (options.sourcePage) {
    where += ' AND m.source_page = ?';
    args.push(options.sourcePage);
  }
  if (options.assignedTo !== undefined) {
    where += ' AND m.assigned_to = ?';
    args.push(options.assignedTo);
  }

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as c FROM contact_messages m ${where}`,
    args,
  });
  const total = Number(countResult.rows[0]?.c ?? 0);

  const result = await db.execute({
    sql: `
      SELECT m.*, u.name as assigned_to_name, c.first_name, c.last_name, c.email
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to
      LEFT JOIN contacts c ON c.id = m.contact_id
      ${where}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, options.limit ?? 50, options.offset ?? 0],
  });

  const messages = result.rows.map((row: any) => {
    const message = rowToContactMessage(row);
    if (row.first_name || row.last_name || row.email) {
      message.contact = rowToContact(row);
    }
    return message;
  });

  return { messages, total };
}

export async function getNotesForContact(contactId: number): Promise<ContactNote[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT n.*, u.name as author_name
      FROM contact_notes n
      JOIN users u ON u.id = n.author_admin_id
      WHERE n.contact_id = ?
      ORDER BY n.created_at DESC
    `,
    args: [contactId],
  });
  return result.rows.map(rowToContactNote);
}

export async function createContactNote(
  data: Omit<ContactNote, 'id' | 'createdAt' | 'authorName'>
): Promise<ContactNote> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contact_notes (contact_id, author_admin_id, note, visibility, created_at)
          VALUES (?, ?, ?, ?, unixepoch())`,
    args: [data.contactId, data.authorAdminId ?? null, data.note, data.visibility || 'admin'],
  });
  const id = Number(result.lastInsertRowid);
  await createContactActivity(data.contactId, 'note_added', 'Note added', undefined, { noteId: id, visibility: data.visibility });
  const notes = await getNotesForContact(data.contactId);
  return notes.find((n) => n.id === id)!;
}

export async function updateContactNote(
  id: number,
  data: Partial<ContactNote>,
  adminId: number
): Promise<ContactNote | null> {
  const db = getDb();
  const existing = await db.execute({
    sql: 'SELECT * FROM contact_notes WHERE id = ?',
    args: [id],
  });
  if (existing.rows.length === 0) return null;
  const note = existing.rows[0];
  if (Number(note.author_admin_id) !== adminId) return null;

  await db.execute({
    sql: 'UPDATE contact_notes SET note = ?, visibility = ? WHERE id = ?',
    args: [data.note ?? note.note, data.visibility ?? note.visibility, id],
  });

  const notes = await getNotesForContact(Number(note.contact_id));
  return notes.find((n) => n.id === id)!;
}

export async function deleteContactNote(id: number, adminId: number): Promise<boolean> {
  const db = getDb();
  const existing = await db.execute({
    sql: 'SELECT * FROM contact_notes WHERE id = ?',
    args: [id],
  });
  if (existing.rows.length === 0) return false;
  const note = existing.rows[0];
  if (Number(note.author_admin_id) !== adminId) return false;

  await db.execute({
    sql: 'DELETE FROM contact_notes WHERE id = ?',
    args: [id],
  });
  return true;
}

export async function getTasksForContact(contactId: number): Promise<ContactTask[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT t.*, ua.name as assigned_to_name, uc.name as created_by_name
      FROM contact_tasks t
      LEFT JOIN users ua ON ua.id = t.assigned_to
      JOIN users uc ON uc.id = t.created_by
      WHERE t.contact_id = ?
      ORDER BY t.status = 'done', t.due_date ASC NULLS LAST, t.created_at DESC
    `,
    args: [contactId],
  });
  return result.rows.map(rowToContactTask);
}

export async function getTaskById(id: number): Promise<ContactTask | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT t.*, ua.name as assigned_to_name, uc.name as created_by_name
      FROM contact_tasks t
      LEFT JOIN users ua ON ua.id = t.assigned_to
      JOIN users uc ON uc.id = t.created_by
      WHERE t.id = ?
    `,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToContactTask(result.rows[0]);
}

export async function createContactTask(
  data: Omit<ContactTask, 'id' | 'createdAt' | 'updatedAt' | 'assignedToName' | 'createdByName'>
): Promise<ContactTask> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contact_tasks (contact_id, title, description, due_date, status, priority, assigned_to, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.contactId,
      data.title,
      data.description ?? null,
      dateToSeconds(data.dueDate),
      data.status || 'open',
      data.priority || 'medium',
      data.assignedTo ?? null,
      data.createdBy ?? null,
    ],
  });
  const id = Number(result.lastInsertRowid);
  await createContactActivity(data.contactId, 'task_created', `Task created: ${data.title}`, data.description, { taskId: id });
  return (await getTaskById(id))!;
}

export async function updateContactTask(
  id: number,
  data: Partial<ContactTask>
): Promise<ContactTask | null> {
  const db = getDb();
  const existing = await getTaskById(id);
  if (!existing) return null;

  const merged = { ...existing, ...data };
  await db.execute({
    sql: `UPDATE contact_tasks SET
      title = ?, description = ?, due_date = ?, status = ?, priority = ?, assigned_to = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [
      merged.title,
      merged.description ?? null,
      dateToSeconds(merged.dueDate),
      merged.status,
      merged.priority,
      merged.assignedTo ?? null,
      id,
    ],
  });

  if (data.status === 'done' && existing.status !== 'done') {
    await createContactActivity(existing.contactId, 'task_completed', `Task completed: ${merged.title}`, undefined, { taskId: id });
  }

  return getTaskById(id);
}

export async function getTasks(options: {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: number;
  contactId?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<{ tasks: ContactTask[]; total: number }> {
  const db = getDb();
  let where = 'WHERE 1=1';
  const args: (string | number)[] = [];
  if (options.status) {
    where += ' AND status = ?';
    args.push(options.status);
  }
  if (options.priority) {
    where += ' AND priority = ?';
    args.push(options.priority);
  }
  if (options.assignedTo !== undefined) {
    where += ' AND assigned_to = ?';
    args.push(options.assignedTo);
  }
  if (options.contactId) {
    where += ' AND contact_id = ?';
    args.push(options.contactId);
  }

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as c FROM contact_tasks ${where}`,
    args,
  });
  const total = Number(countResult.rows[0]?.c ?? 0);

  const result = await db.execute({
    sql: `
      SELECT t.*, ua.name as assigned_to_name, uc.name as created_by_name
      FROM contact_tasks t
      LEFT JOIN users ua ON ua.id = t.assigned_to
      JOIN users uc ON uc.id = t.created_by
      ${where}
      ORDER BY status = 'done', due_date ASC NULLS LAST, created_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, options.limit ?? 50, options.offset ?? 0],
  });

  return { tasks: result.rows.map(rowToContactTask), total };
}

export async function getAllTags(): Promise<ContactTag[]> {
  const db = getDb();
  const result = await db.execute('SELECT * FROM contact_tags ORDER BY category, name');
  return result.rows.map(rowToContactTag);
}

export async function getTagsForContact(contactId: number): Promise<ContactTag[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT t.* FROM contact_tags t
      JOIN contact_tag_assignments a ON a.tag_id = t.id
      WHERE a.contact_id = ?
      ORDER BY t.category, t.name
    `,
    args: [contactId],
  });
  return result.rows.map(rowToContactTag);
}

export async function createTag(data: Omit<ContactTag, 'id' | 'createdAt'>): Promise<ContactTag> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contact_tags (name, color, category, created_at)
          VALUES (?, ?, ?, unixepoch())`,
    args: [data.name.toLowerCase().trim(), data.color, data.category || 'custom'],
  });
  return (await getTagById(Number(result.lastInsertRowid)))!;
}

export async function getTagById(id: number): Promise<ContactTag | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM contact_tags WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToContactTag(result.rows[0]);
}

export async function getTagByName(name: string): Promise<ContactTag | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM contact_tags WHERE lower(name) = ?',
    args: [name.toLowerCase().trim()],
  });
  if (result.rows.length === 0) return null;
  return rowToContactTag(result.rows[0]);
}

export async function addTagToContact(contactId: number, tagId: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR IGNORE INTO contact_tag_assignments (contact_id, tag_id, created_at) VALUES (?, ?, unixepoch())`,
    args: [contactId, tagId],
  });
  const tag = await getTagById(tagId);
  await createContactActivity(contactId, 'tag_added', `Tag added: ${tag?.name || tagId}`, undefined, { tagId });
}

export async function removeTagFromContact(contactId: number, tagId: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM contact_tag_assignments WHERE contact_id = ? AND tag_id = ?',
    args: [contactId, tagId],
  });
  const tag = await getTagById(tagId);
  await createContactActivity(contactId, 'tag_removed', `Tag removed: ${tag?.name || tagId}`, undefined, { tagId });
}

export async function deleteTag(id: number): Promise<boolean> {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM contact_tag_assignments WHERE tag_id = ?',
    args: [id],
  });
  const result = await db.execute({
    sql: 'DELETE FROM contact_tags WHERE id = ?',
    args: [id],
  });
  return Number(result.rowsAffected) > 0;
}

export async function getActivitiesForContact(contactId: number): Promise<ContactActivity[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT * FROM contact_activities
      WHERE contact_id = ?
      ORDER BY created_at DESC, id DESC
    `,
    args: [contactId],
  });
  return result.rows.map(rowToContactActivity);
}

export async function createContactActivity(
  contactId: number,
  activityType: ActivityType,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<ContactActivity> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO contact_activities (contact_id, activity_type, title, description, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, unixepoch())`,
    args: [contactId, activityType, title, description ?? null, JSON.stringify(metadata ?? {})],
  });
  const id = Number(result.lastInsertRowid);
  const activities = await getActivitiesForContact(contactId);
  return activities.find((a) => a.id === id)!;
}

export async function upsertContactFromSubmission(params: {
  type: string;
  name?: string;
  email: string;
  formSubmissionId: number;
  subject?: string;
  message?: string;
  sourcePage?: string;
}): Promise<{ contactId: number; messageId: number }> {
  const db = getDb();
  const normalizedEmail = params.email.toLowerCase().trim();
  let contact = await getContactByEmail(normalizedEmail);

  if (!contact) {
    const [firstName, ...rest] = (params.name || '').trim().split(/\s+/);
    const lastName = rest.join(' ') || undefined;
    const sourceMap: Record<string, ContactSource> = {
      contact: 'contact-form',
      'event-updates': 'event-updates',
      membership: 'membership-form',
      volunteer: 'volunteer-form',
    };
    contact = await createContact({
      type: 'person',
      firstName: firstName || undefined,
      lastName,
      email: normalizedEmail,
      source: sourceMap[params.type] || 'manual',
      status: 'lead',
      lifecycleStage: 'awareness',
      interests: [],
      consentEmail: false,
      consentSms: false,
      isActive: true,
    });
  }

  await db.execute({
    sql: 'UPDATE form_submissions SET contact_id = ? WHERE id = ?',
    args: [contact.id, params.formSubmissionId],
  });

  const message = await createContactMessage({
    contactId: contact.id,
    formSubmissionId: params.formSubmissionId,
    subject: params.subject,
    message: params.message,
    sourcePage: params.sourcePage || params.type,
    status: 'new',
  });

  return { contactId: contact.id, messageId: message.id };
}

export async function getCrmDashboardStats(): Promise<{ totalContacts: number; activeMembers: number; newMessages: number; openTasks: number }> {
  const db = getDb();
  const [contacts, members, messages, tasks] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM contacts'),
    db.execute("SELECT COUNT(*) as c FROM contacts WHERE lifecycle_stage = 'member' AND is_active = 1"),
    db.execute("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'new'"),
    db.execute("SELECT COUNT(*) as c FROM contact_tasks WHERE status != 'done' AND status != 'cancelled'"),
  ]);
  return {
    totalContacts: Number(contacts.rows[0]?.c ?? 0),
    activeMembers: Number(members.rows[0]?.c ?? 0),
    newMessages: Number(messages.rows[0]?.c ?? 0),
    openTasks: Number(tasks.rows[0]?.c ?? 0),
  };
}
