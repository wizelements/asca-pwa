import { connectDB } from '@/lib/db';
import { Member } from '@/lib/models/Member';
import { duesOverdueTemplate, duesReminderTemplate, sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateNextDueDate(from: Date) {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 3);
  return next;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!process.env.DUES_CRON_SECRET || authHeader !== `Bearer ${process.env.DUES_CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const reminderWindowDays = Number(process.env.DUES_REMINDER_DAYS || 14);
    const reminderWindow = new Date(today);
    reminderWindow.setDate(reminderWindow.getDate() + reminderWindowDays);

    const members = await Member.find({ isActive: true }).lean() as Array<any>;
    const updates: Array<{ id: string; type: 'reminder' | 'overdue' }> = [];

    for (const member of members) {
      const memberId = (member._id as any).toString();
      const dueDate = member.duesNextDueAt ? new Date(member.duesNextDueAt) : calculateNextDueDate(member.joinDate || today);
      const displayName = `${member.firstName} ${member.lastName}`.trim();

      const isOverdue = dueDate <= today;
      const isWithinReminderWindow = dueDate <= reminderWindow && dueDate > today;

      if (isWithinReminderWindow && !member.duesReminderSentAt) {
        const emailResult = await sendEmail({
          to: member.email,
          subject: 'ASCA Quarterly Dues Reminder',
          html: duesReminderTemplate({
            name: displayName,
            dueDate: formatDate(dueDate),
            daysRemaining: Math.max(1, Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)),
          }),
        });

        if (emailResult.success) {
          await Member.updateOne(
            { _id: member._id },
            { $set: { duesReminderSentAt: today, duesNextDueAt: dueDate } }
          );
          updates.push({ id: memberId, type: 'reminder' });
        }
      }

      if (isOverdue && !member.duesOverdueSentAt) {
        const emailResult = await sendEmail({
          to: member.email,
          subject: 'ASCA Quarterly Dues Now Due',
          html: duesOverdueTemplate({
            name: displayName,
            dueDate: formatDate(dueDate),
          }),
        });

        if (emailResult.success) {
          await Member.updateOne(
            { _id: member._id },
            { $set: { duesOverdueSentAt: today, duesNextDueAt: dueDate } }
          );
          updates.push({ id: memberId, type: 'overdue' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalMembers: members.length,
      notificationsSent: updates.length,
      updates,
    });
  } catch (error) {
    console.error('[DUES NOTIFY] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send dues notifications' },
      { status: 500 }
    );
  }
}
