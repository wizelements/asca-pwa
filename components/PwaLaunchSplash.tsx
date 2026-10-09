import Image from 'next/image';

export default function PwaLaunchSplash() {
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

        <p className="pwa-launch-splash__eyebrow">Atlanta Saddle Club Association</p>
        <h1 className="pwa-launch-splash__title">ASCA</h1>
        <p className="pwa-launch-splash__tagline">We Ride To Inspire</p>

        <div className="pwa-launch-splash__rule" />
        <p className="pwa-launch-splash__location">Atlanta · Georgia</p>
      </div>
    </div>
  );
}
