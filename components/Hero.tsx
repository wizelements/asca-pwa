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
    <section className="hero relative py-32 min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {image && (
        <>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
          {/* Darken Overlay */}
          {darken && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            backgroundColor: 'var(--color-secondary, #4a4b02)',
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <div className="container text-center text-white relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-amber-300">
            {subtitle}
          </p>
        )}
        {cta && (
          <a
            href={cta.link}
            className="inline-block px-8 py-3 font-bold rounded hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-accent, #f5d800)' }}
          >
            {cta.text}
          </a>
        )}
      </div>
    </section>
  );
}
