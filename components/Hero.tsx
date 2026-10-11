import ManagedImage from '@/components/media/ManagedImage';
import { getCachedSiteIdentity } from '@/lib/db/queries-cache';

interface HeroProps {
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    link: string;
  };
  darken?: boolean;
}

export default async function Hero({
  image,
  imageAlt,
  title,
  subtitle,
  cta,
  darken = true,
}: HeroProps) {
  const identity = await getCachedSiteIdentity().catch(() => ({
    siteName: 'Atlanta Saddle Club Association',
    motto: 'We Ride To Inspire',
  }));

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden md:min-h-[720px]">
      {image ? (
        <>
          <ManagedImage
            src={image}
            alt={imageAlt || ''}
            fill
            className="absolute inset-0 h-full w-full object-cover"
            sizes="100vw"
            priority
          />
          {darken && (
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,20,14,0.88)_0%,rgba(11,20,14,0.68)_38%,rgba(16,31,20,0.30)_68%,rgba(16,31,20,0.12)_100%)]"
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(230,213,67,0.14),transparent_24rem),linear-gradient(120deg,#122217,#1f6b3a)]"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.08),transparent_28%,transparent_72%,rgba(0,0,0,.30))]" aria-hidden="true" />

      <div className="container relative z-10 flex min-h-[620px] items-center py-24 md:min-h-[720px] md:py-32">
        <div className="equestrian-panel w-full max-w-[760px] px-7 py-10 sm:px-10 md:px-14 md:py-14">
          <div className="relative z-10">
            <p className="heritage-rule text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent sm:text-[11px]">
              {identity.siteName}
            </p>

            <h1 className="mt-7 max-w-3xl font-serif text-5xl font-medium leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-[5.65rem]">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/82 sm:text-lg md:text-xl md:leading-9">
                {subtitle}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {cta && (
                <a href={cta.link} className="btn-accent">
                  {cta.text}
                </a>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Horsemanship · Fellowship · Service
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 hidden text-right text-white/45 md:block">
        <p className="font-serif text-sm italic tracking-wide">Atlanta, Georgia</p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em]">Equestrian tradition in motion</p>
      </div>
    </section>
  );
}
