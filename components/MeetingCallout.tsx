import { getCachedSiteContent, siteText } from '@/lib/site-content';

export default async function MeetingCallout() {
  const copy = await getCachedSiteContent();
  return (
    <div className="rounded-2xl border border-brand-forest/20 bg-brand-forest px-6 py-6 text-center text-white shadow-sm md:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
        {siteText(copy, 'shared.meeting.label')}
      </p>
      <p className="mt-3 text-lg font-semibold leading-relaxed md:text-xl">
        We meet on the {siteText(copy, 'shared.meeting.cadence')} at {siteText(copy, 'shared.meeting.time')} at{' '}
        {siteText(copy, 'shared.meeting.venue')}, {siteText(copy, 'shared.meeting.address')}.
      </p>
    </div>
  );
}
