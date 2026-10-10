'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type InstallMode = 'native' | 'ios'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

const PROMPT_LAST_SEEN_KEY = 'asca:pwa-install-prompt-last-seen'
const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000
const PROMPT_DELAY_MS = 8000

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

function recentlyPrompted() {
  try {
    const raw = window.localStorage.getItem(PROMPT_LAST_SEEN_KEY)
    if (!raw) return false
    const lastSeen = Number(raw)
    return Number.isFinite(lastSeen) && Date.now() - lastSeen < PROMPT_COOLDOWN_MS
  } catch {
    return false
  }
}

function rememberPrompt() {
  try {
    window.localStorage.setItem(PROMPT_LAST_SEEN_KEY, String(Date.now()))
  } catch {
    // Installation remains available even if storage is blocked.
  }
}

export default function PwaInstallPrompt() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<InstallMode>('native')
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname === '/share') return
    if (isRunningStandalone() || recentlyPrompted()) return

    let revealTimer: number | undefined
    let nativeEvent: BeforeInstallPromptEvent | null = null

    const reveal = (nextMode: InstallMode) => {
      if (revealTimer) window.clearTimeout(revealTimer)
      revealTimer = window.setTimeout(() => {
        if (isRunningStandalone() || recentlyPrompted()) return
        setMode(nextMode)
        rememberPrompt()
        setVisible(true)
      }, PROMPT_DELAY_MS)
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      nativeEvent = event as BeforeInstallPromptEvent
      setInstallEvent(nativeEvent)
      reveal('native')
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    // iOS has no beforeinstallprompt event. Offer a quiet install nudge only
    // after the visitor has had time to use the site.
    if (isIosDevice()) reveal('ios')

    return () => {
      if (revealTimer) window.clearTimeout(revealTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [pathname])

  const dismiss = () => {
    rememberPrompt()
    setVisible(false)
    setShowIosSteps(false)
  }

  const install = async () => {
    if (!installEvent) return

    try {
      await installEvent.prompt()
      await installEvent.userChoice
    } finally {
      rememberPrompt()
      setVisible(false)
      setInstallEvent(null)
    }
  }

  if (!visible) return null

  return (
    <aside
      className="pwa-safe-bottom fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-3 sm:px-5 sm:pb-5"
      aria-label="Install ASCA"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated shadow-2xl">
        <div className="h-1 w-full bg-brand-accent" />
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-forest p-1.5 shadow-sm">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-forest">ASCA App</p>
                <h2 className="mt-0.5 text-base font-bold text-brand-fg-primary">Keep ASCA one tap away</h2>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-fg-muted hover:bg-brand-bg-subtle hover:text-brand-fg-primary"
                aria-label="Dismiss install suggestion"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p className="mt-1 text-sm leading-5 text-brand-fg-secondary">
              Install the Atlanta Saddle Club Association site for a clean standalone experience and quick home-screen access.
            </p>

            {mode === 'ios' && showIosSteps && (
              <ol className="mt-3 space-y-1.5 rounded-xl bg-brand-bg-subtle p-3 text-sm leading-5 text-brand-fg-primary">
                <li><strong>1.</strong> Tap the Share button in your browser.</li>
                <li><strong>2.</strong> Choose <strong>Add to Home Screen</strong>.</li>
                <li><strong>3.</strong> Tap <strong>Add</strong>.</li>
              </ol>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {mode === 'native' ? (
                <button type="button" onClick={install} className="btn-primary min-h-[44px] px-5 py-2.5 text-xs">
                  Install ASCA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowIosSteps((value) => !value)}
                  className="btn-primary min-h-[44px] px-5 py-2.5 text-xs"
                  aria-expanded={showIosSteps}
                >
                  {showIosSteps ? 'Hide instructions' : 'How to install'}
                </button>
              )}
              <button type="button" onClick={dismiss} className="btn-secondary min-h-[44px] px-5 py-2.5 text-xs">
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
