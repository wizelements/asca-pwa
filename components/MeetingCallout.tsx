import { getCachedSiteContent, siteText } from '@/lib/site-content';

export default async function MeetingCallout() {
  const copy = await getCachedSiteContent();

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-brand-forest/15 bg-[linear-gradient(135deg,#163d25,#1f6b3a_58%,#174f2b)] px-7 py-8 text-center text-white shadow-[0_24px_60px_rgba(24,61,36,.16)] md:px-12 md:py-10">
      <div className="absolute inset-[9px] rounded-[1.2rem] border border-brand-accent/20" aria-hidden="true" />
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full border border-white/5" aria-hidden="true" />
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-white/5" aria-hidden="true" />

      <div className="relative z-10">
        <p className="heritage-rule justify-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
          {siteText(copy, 'shared.meeting.label')}
        </p>

        <p className="mx-auto mt-5 max-w-3xl font-serif text-2xl font-medium leading-snug md:text-3xl">
          We meet on the {siteText(copy, 'shared.meeting.cadence')} at {siteText(copy, 'shared.meeting.time')}
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
          {siteText(copy, 'shared.meeting.venue')}, {siteText(copy, 'shared.meeting.address')}
        </p>
      </div>
    </div>
  );
}
