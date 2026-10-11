import { getCachedSiteContent, siteText } from '@/lib/site-content';

export default async function MeetingCallout() {
  const copy = await getCachedSiteContent();

  return (
    <div className="rounded-2xl bg-brand-forest px-7 py-9 text-center text-white shadow-[0_18px_42px_rgba(24,61,36,.14)] md:px-12 md:py-11">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-accent">
        {siteText(copy, 'shared.meeting.label')}
      </p>

      <p className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-semibold leading-snug md:text-4xl">
        We meet on the {siteText(copy, 'shared.meeting.cadence')} at {siteText(copy, 'shared.meeting.time')}
      </p>

      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/95 md:text-lg">
        {siteText(copy, 'shared.meeting.venue')}, {siteText(copy, 'shared.meeting.address')}
      </p>
    </div>
  );
}
