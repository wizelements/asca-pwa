import Image from 'next/image';
import { getCachedSiteIdentity } from '@/lib/db/queries-cache';

export default async function PwaLaunchSplash() {
  const identity = await getCachedSiteIdentity().catch(() => ({
    siteName: 'Atlanta Saddle Club Association',
    motto: 'We Ride To Inspire',
    heroDescription: "Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta.",
  }));

  return (
    <div
      className="pwa-launch-splash"
      data-testid="pwa-launch-splash"
      aria-hidden="true"
    >
      <div className="pwa-launch-splash__halo" />
      <div className="pwa-launch-splash__content">
        <div className="pwa-launch-splash__mark">
          <Image
            src="/icons/icon-512.png"
            alt=""
            width={144}
            height={144}
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <p className="pwa-launch-splash__eyebrow">{identity.siteName}</p>
        <div className="pwa-launch-splash__title">ASCA</div>
        <p className="pwa-launch-splash__tagline">{identity.motto}</p>

        <div className="pwa-launch-splash__rule" />
        <p className="pwa-launch-splash__location">Atlanta · Georgia</p>
      </div>
    </div>
  );
}
