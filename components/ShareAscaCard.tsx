'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function runningStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function iosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

export default function ShareAscaCard({ siteUrl }: { siteUrl: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setStandalone(runningStandalone());
    setIsIos(iosDevice());

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setStandalone(true);
      setInstallEvent(null);
      setInstallHelp(false);
      setMessage('ASCA is installed.');
    };

    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const share = async () => {
    const shareData = {
      title: 'Atlanta Saddle Club Association',
      text: 'Check out the Atlanta Saddle Club Association — We Ride To Inspire.',
      url: siteUrl,
    };

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setMessage('Share menu opened.');
        return;
      }

      await copyText(siteUrl);
      setMessage('Website link copied.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage('Could not open sharing. Use Copy Link instead.');
    }
  };

  const copy = async () => {
    try {
      await copyText(siteUrl);
      setMessage('Website link copied.');
    } catch {
      setMessage('Could not copy automatically. Press and hold the website address below.');
    }
  };

  const install = async () => {
    if (standalone) {
      setMessage('ASCA is already installed on this device.');
      return;
    }

    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setMessage('Installing ASCA…');
      }
      setInstallEvent(null);
      return;
    }

    setInstallHelp(true);
    if (isIos) {
      setMessage('Use Safari’s Share menu, then choose Add to Home Screen.');
    } else {
      setMessage('Use your browser menu and choose Install app or Add to Home screen.');
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-brand-border-subtle bg-brand-bg-elevated shadow-xl shadow-black/5">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden bg-brand-forest p-7 sm:p-10">
          <div
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-white/10"
            aria-hidden="true"
          />

          <div className="relative w-full max-w-sm text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white p-2 shadow-lg">
              <Image
                src="/icons/icon-192.png"
                alt="Atlanta Saddle Club Association"
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-brand-accent">
              Atlanta Saddle Club Association
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white">
              We Ride To Inspire
            </h2>

            <div className="mx-auto mt-7 w-full max-w-[19rem] rounded-[1.75rem] bg-white p-4 shadow-2xl">
              <img
                src="/qr/asca-site.svg"
                alt="QR code for the Atlanta Saddle Club Association website"
                className="aspect-square w-full"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-white">Scan to visit ASCA</p>
            <p className="mt-1 break-all text-xs text-white/70">{siteUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-forest">
            Member-ready sharing
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-brand-fg-primary sm:text-4xl">
            Put ASCA in someone&apos;s hand in seconds.
          </h2>
          <p className="mt-4 text-base leading-7 text-brand-fg-secondary">
            Share the official ASCA website from your phone, copy the link for a message,
            or install the app so this QR page is always easy to reach.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={share} className="btn-primary w-full">
              Share ASCA
            </button>
            <button type="button" onClick={copy} className="btn-secondary w-full">
              Copy Link
            </button>
            <button
              type="button"
              onClick={install}
              className="btn-accent w-full"
              disabled={standalone}
            >
              {standalone ? 'ASCA Installed' : 'Install ASCA'}
            </button>
            <a href={siteUrl} className="btn-secondary w-full" target="_blank" rel="noopener noreferrer">
              Open Website
            </a>
          </div>

          <a
            href="/qr/asca-site.svg"
            download="ASCA-website-QR.svg"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-brand-forest underline-offset-4 hover:underline"
          >
            Download QR for print or flyers
          </a>

          {installHelp && (
            <div className="mt-5 rounded-2xl border border-brand-border-subtle bg-brand-bg-subtle p-4">
              <p className="text-sm font-bold text-brand-fg-primary">Install on this device</p>
              {isIos ? (
                <ol className="mt-2 space-y-1 text-sm leading-6 text-brand-fg-secondary">
                  <li>1. Open this page in Safari.</li>
                  <li>2. Tap Share.</li>
                  <li>3. Choose Add to Home Screen, then Add.</li>
                </ol>
              ) : (
                <p className="mt-2 text-sm leading-6 text-brand-fg-secondary">
                  Open your browser menu and choose <strong>Install app</strong> or
                  <strong> Add to Home screen</strong>.
                </p>
              )}
            </div>
          )}

          <div className="mt-5 min-h-6" aria-live="polite">
            {message && <p className="text-sm font-semibold text-brand-forest">{message}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
