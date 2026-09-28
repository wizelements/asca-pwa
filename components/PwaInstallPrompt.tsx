'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type InstallMode = 'native' | 'ios'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

const SESSION_PROMPT_KEY = 'asca:pwa-install-prompt-shown'

function isRunningStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

function isIosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isClassicIos = /iphone|ipad|ipod/.test(userAgent)
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  return isClassicIos || isIpadOs
}

export default function PwaInstallPrompt() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<InstallMode>('native')
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const primaryActionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return
    if (isRunningStandalone()) return
    if (window.sessionStorage.getItem(SESSION_PROMPT_KEY) === '1') return

    let iosTimer: number | undefined

    const markPromptShown = () => {
      window.sessionStorage.setItem(SESSION_PROMPT_KEY, '1')
    }

    const showNativeInstallPrompt = (event: Event) => {
      event.preventDefault()

      setInstallEvent(event as BeforeInstallPromptEvent)
      setMode('native')
      markPromptShown()
      setVisible(true)
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', showNativeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    // iOS does not expose beforeinstallprompt. Give first-time Safari visitors
    // the platform-specific installation instructions instead.
    if (isIosDevice()) {
      iosTimer = window.setTimeout(() => {
        if (isRunningStandalone()) return

        setMode('ios')
        markPromptShown()
        setVisible(true)
      }, 500)
    }

    return () => {
      if (iosTimer) window.clearTimeout(iosTimer)
      window.removeEventListener('beforeinstallprompt', showNativeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [pathname])

  useEffect(() => {
    if (!visible) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => primaryActionRef.current?.focus(), 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [visible])

  const dismiss = () => {
    setVisible(false)
  }

  const install = async () => {
    if (!installEvent) return

    try {
      await installEvent.prompt()
      await installEvent.userChoice
    } finally {
      setVisible(false)
      setInstallEvent(null)
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="asca-install-title"
        aria-describedby="asca-install-description"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-brand-bg-elevated shadow-2xl"
      >
        <div className="h-1.5 w-full bg-brand-accent" />

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-forest p-2 shadow-sm">
              <Image
                src="/icons/icon-192.png"
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </span>

            <div className="min-w-0 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-forest">
                ASCA App
              </p>
              <h2
                id="asca-install-title"
                className="mt-1 text-2xl font-bold leading-tight text-brand-fg-primary"
              >
                Install ASCA
              </h2>
            </div>
          </div>

          {mode === 'native' ? (
            <>
              <p
                id="asca-install-description"
                className="mt-5 text-sm leading-6 text-brand-fg-secondary"
              >
                Add Atlanta Saddle Club Association to your device for a faster,
                app-style experience with quick access from your home screen.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  ref={primaryActionRef}
                  type="button"
                  onClick={install}
                  className="btn-primary w-full"
                >
                  Install ASCA
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="btn-secondary w-full"
                >
                  Not now
                </button>
              </div>
            </>
          ) : (
            <>
              <div id="asca-install-description" className="mt-5">
                <p className="text-sm leading-6 text-brand-fg-secondary">
                  Add ASCA to your iPhone or iPad home screen:
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-brand-fg-primary">
                  <li className="flex gap-3">
                    <span className="font-bold text-brand-forest">1.</span>
                    <span>Tap the <strong>Share</strong> button in Safari.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-brand-forest">2.</span>
                    <span>Choose <strong>Add to Home Screen</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-brand-forest">3.</span>
                    <span>Tap <strong>Add</strong> to install ASCA.</span>
                  </li>
                </ol>
              </div>

              <button
                ref={primaryActionRef}
                type="button"
                onClick={dismiss}
                className="btn-primary mt-6 w-full"
              >
                Got it
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
