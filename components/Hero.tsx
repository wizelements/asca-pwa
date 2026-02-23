import Image from 'next/image';

interface HeroProps {
  image?: string;
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
  title,
  subtitle,
  cta,
  darken = true,
}: HeroProps) {
  return (
    <section className="hero relative flex min-h-[420px] items-center justify-center overflow-hidden py-28">
      {/* Background Image */}
      {image && (
        <>
          <Image
            src={image}
            alt={title}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            priority
          />
          {/* Darken Overlay */}
          {darken && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(24, 18, 12, 0.72), rgba(31, 107, 58, 0.35))',
                zIndex: 1,
              }}
            />
          )}
        </>
      )}

      {/* Fallback Background */}
      {!image && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top, rgba(231, 188, 71, 0.35), transparent 60%), linear-gradient(135deg, #1f1f1f, #1f6b3a)',
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <div className="container relative z-10 text-center text-white">
        <p className="section-label text-brand-accent">Atlanta Saddle Club Association</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-5">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto max-w-3xl text-lg md:text-2xl text-amber-200">
            {subtitle}
          </p>
        )}
        {cta && (
          <a
            href={cta.link}
            className="btn-accent mt-8 inline-flex"
          >
            {cta.text}
          </a>
        )}
      </div>
    </section>
  );
}
