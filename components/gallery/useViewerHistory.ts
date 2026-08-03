'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ViewerHistoryState {
  ascaViewer?: boolean;
  idx?: number;
}

/**
 * Syncs the lightbox viewer with the browser URL and history
 * (Airbnb-style `?photo=N` deep links).
 *
 * Uses the raw History API instead of next/navigation on purpose: router
 * navigation would re-render the server page and lose grid scroll position.
 *
 * Behavior:
 * - Opening pushes a history entry, so browser Back closes the viewer.
 * - Next/prev replace the entry, so Back never steps through every photo.
 * - Deep links (`?photo=3`) rewrite the landing entry to the clean URL and
 *   push the viewer entry on top, so both Back and the close button return
 *   to the page instead of leaving the site.
 */
export function useViewerHistory(imageCount: number, initialPhotoIndex?: number | null) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const didInit = useRef(false);

  const setPhotoUrl = useCallback((idx: number, mode: 'push' | 'replace') => {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', String(idx + 1));
    const state: ViewerHistoryState = { ...(window.history.state ?? {}), ascaViewer: true, idx };
    const href = `${url.pathname}${url.search}${url.hash}`;
    if (mode === 'push') {
      window.history.pushState(state, '', href);
    } else {
      window.history.replaceState(state, '', href);
    }
  }, []);

  const openViewer = useCallback(
    (idx: number) => {
      setViewerIndex(idx);
      setViewerOpen(true);
      setPhotoUrl(idx, 'push');
    },
    [setPhotoUrl]
  );

  const moveViewer = useCallback(
    (idx: number) => {
      setViewerIndex(idx);
      setPhotoUrl(idx, 'replace');
    },
    [setPhotoUrl]
  );

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    if ((window.history.state as ViewerHistoryState | null)?.ascaViewer) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('photo');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as ViewerHistoryState | null;
      if (
        state?.ascaViewer &&
        typeof state.idx === 'number' &&
        Number.isInteger(state.idx) &&
        state.idx >= 0 &&
        state.idx < imageCount
      ) {
        setViewerIndex(state.idx);
        setViewerOpen(true);
      } else {
        setViewerOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);

    if (
      !didInit.current &&
      initialPhotoIndex != null &&
      initialPhotoIndex >= 0 &&
      initialPhotoIndex < imageCount
    ) {
      didInit.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete('photo');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
      setViewerIndex(initialPhotoIndex);
      setViewerOpen(true);
      setPhotoUrl(initialPhotoIndex, 'push');
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, [imageCount, initialPhotoIndex, setPhotoUrl]);

  return { viewerOpen, viewerIndex, openViewer, moveViewer, closeViewer };
}
