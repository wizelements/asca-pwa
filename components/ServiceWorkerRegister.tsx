'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') {
        registration?.update().catch(() => undefined);
      }
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // Keep the installed app fresh without forcibly reloading an open page.
        // The ASCA worker does not cache page HTML, so an update can activate
        // safely and the next navigation naturally uses current application code.
        await registration.update();
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    window.addEventListener('focus', checkForUpdate);
    document.addEventListener('visibilitychange', checkForUpdate);

    return () => {
      window.removeEventListener('load', register);
      window.removeEventListener('focus', checkForUpdate);
      document.removeEventListener('visibilitychange', checkForUpdate);
    };
  }, []);

  return null;
}
