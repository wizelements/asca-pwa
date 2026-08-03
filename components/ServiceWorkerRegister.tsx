'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      let refreshing = false;
      const handleControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };

      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/', updateViaCache: 'none' })
          .then((registration) => {
            console.log('✓ Service Worker registered:', registration);

            registration.update();
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.error('✗ Service Worker registration failed:', error);
          });
      };

      window.addEventListener('load', registerServiceWorker);

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        window.removeEventListener('load', registerServiceWorker);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return null;
}
