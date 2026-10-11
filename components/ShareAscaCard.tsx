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

interface ShareCardCopy {
  label: string;
  title: string;
  body: string;
  scanLabel: string;
  downloadLabel: string;
}

export default function ShareAscaCard({
  siteUrl,
  siteName,
  motto,
  copy: pageCopy,
}: {
  siteUrl: string;
  siteName: string;
  motto: string;
  copy: ShareCardCopy;
}) {
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
      title: siteName,
      text: `Check out ${siteName} — ${motto}.`,
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
    <section className="overflow-hidden rounded-2xl border border-brand-forest/10 bg-white shadow-[0_18px_48px_rgba(34,48,38,.08)]">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex min-h-[30rem] items-center justify-center overflow-hidden bg-[#17492c] p-7 sm:p-10">
          <div className="relative w-full max-w-sm text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
              <Image
                src="/icons/icon-192.png"
                alt={siteName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-accent">
              {siteName}
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold text-white">
              {motto}
            </h2>

            <div className="mx-auto mt-7 w-full max-w-[19rem] rounded-2xl bg-white p-4 shadow-xl">
              <Image
                src="/qr/asca-site.svg"
                alt={`QR code for the ${siteName} website`}
                width={304}
                height={304}
                unoptimized
                className="aspect-square w-full"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-white">{pageCopy.scanLabel}</p>
            <p className="mt-2 break-all text-sm text-white/90">{siteUrl.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest">
            {pageCopy.label}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-brand-fg-primary sm:text-5xl">
            {pageCopy.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-brand-fg-secondary">
            {pageCopy.body}
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
            <a href={siteUrl} className="btn-secondary w-full">
              Open Website
            </a>
          </div>

          <a
            href="/qr/asca-site.svg"
            download="ASCA-website-QR.svg"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-brand-forest underline-offset-4 hover:underline"
          >
            {pageCopy.downloadLabel}
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
