import ManagedImage from '@/components/media/ManagedImage';

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

export default function Hero({
  image,
  imageAlt,
  title,
  subtitle,
  cta,
  darken = true,
}: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[500px] items-center overflow-hidden py-24 md:min-h-[580px] md:py-32">
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
              className="absolute inset-0 bg-[linear-gradient(110deg,rgba(16,20,16,0.82)_0%,rgba(16,20,16,0.58)_50%,rgba(31,107,58,0.24)_100%)]"
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,213,67,0.22),transparent_32%),linear-gradient(120deg,#17251c,#1f6b3a)]"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />

      <div className="container relative z-10">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-white/20 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent backdrop-blur-sm">
            Atlanta Saddle Club Association
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85 md:text-xl md:leading-9">
              {subtitle}
            </p>
          )}
          {cta && (
            <a href={cta.link} className="btn-accent mt-8 inline-flex min-h-[48px]">
              {cta.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
