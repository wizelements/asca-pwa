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
    <section className="relative isolate min-h-[600px] overflow-hidden md:min-h-[690px]">
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
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,19,12,.88)_0%,rgba(8,19,12,.72)_34%,rgba(8,19,12,.38)_64%,rgba(8,19,12,.18)_100%)]"
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(125deg,#102819,#1f6b3a)]"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" aria-hidden="true" />

      <div className="container relative z-10 flex min-h-[600px] items-center py-20 md:min-h-[690px] md:py-28">
        <div className="max-w-[820px]">
          <div className="mb-6 flex items-center gap-4 text-white">
            <span className="h-px w-12 bg-brand-accent" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
              {identity.siteName}
            </p>
          </div>

          <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[0.94] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-[6rem]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/95 md:text-xl md:leading-9">
              {subtitle}
            </p>
          )}

          {cta && (
            <div className="mt-9">
              <a href={cta.link} className="btn-accent">
                {cta.text}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
