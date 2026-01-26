import { connectDB } from '@/lib/db';
import { FormSubmission } from '@/lib/models/Form';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const submission = new FormSubmission({
      ...data,
      submittedAt: new Date(),
      submittedOffline: data.submittedOffline || false,
    });
    await submission.save();
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
