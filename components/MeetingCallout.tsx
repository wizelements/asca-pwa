import { MEETING } from '@/lib/content/site';

export default function MeetingCallout() {
  return (
    <div className="rounded-2xl border border-brand-forest/20 bg-brand-forest px-6 py-6 text-center text-white shadow-sm md:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
        Join Us in Person
      </p>
      <p className="mt-3 text-lg font-semibold leading-relaxed md:text-xl">
        We meet on the {MEETING.cadence} at {MEETING.time} at {MEETING.venue}, {MEETING.address}.
      </p>
    </div>
  );
}
