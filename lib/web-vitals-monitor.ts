/**
 * Web Vitals Performance Monitor
 * Tracks LCP, CLS, FID, TTFB for ASCA PWA
 * 
 * Targets:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FID (First Input Delay): < 100ms
 * - TTFB (Time to First Byte): < 600ms
 */

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

interface VitalsReport {
  lcp: VitalMetric | null;
  cls: VitalMetric | null;
  fid: VitalMetric | null;
  ttfb: VitalMetric | null;
  timestamp: number;
}

export const webVitalsMonitor = {
  /**
   * Initialize monitoring on page load
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const lcpValue = lastEntry.renderTime || lastEntry.loadTime;
      
      console.log('[LCP]', {
        value: lcpValue,
        rating: getRating('lcp', lcpValue),
        element: lastEntry.element?.tagName || 'unknown',
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          console.log('[CLS]', {
            value: clsValue,
            rating: getRating('cls', clsValue),
            sessionValue: (entry as any).value,
          });
        }
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // TTFB (Time to First Byte)
    if (window.performance && window.performance.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.navigationStart;
      console.log('[TTFB]', {
        value: ttfb,
        rating: getRating('ttfb', ttfb),
      });
    }

    // First Input Delay (via web-vitals library if available)
    try {
      // @ts-ignore
      import('web-vitals').then(({ onFID }) => {
        onFID(({ value }: any) => {
          console.log('[FID]', {
            value,
            rating: getRating('fid', value),
          });
        });
      });
    } catch (e) {
      console.warn('web-vitals library not available');
    }
  },

  /**
   * Get current vitals snapshot
   */
  getMetrics(): VitalsReport {
    const metrics: VitalsReport = {
      lcp: null,
      cls: null,
      fid: null,
      ttfb: null,
      timestamp: Date.now(),
    };

    if (typeof window === 'undefined') return metrics;

    // LCP from PerformanceObserver
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1];
        const value = (lastEntry as any).renderTime || (lastEntry as any).loadTime;
        metrics.lcp = {
          name: 'LCP',
          value,
          rating: getRating('lcp', value),
          delta: 0,
        };
      }
    } catch (e) {
      console.error('Error reading LCP', e);
    }

    // CLS from entries
    try {
      const clsEntries = performance.getEntriesByType('layout-shift');
      let clsValue = 0;
      for (const entry of clsEntries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metrics.cls = {
        name: 'CLS',
        value: parseFloat(clsValue.toFixed(3)),
        rating: getRating('cls', clsValue),
        delta: 0,
      };
    } catch (e) {
      console.error('Error reading CLS', e);
    }

    // TTFB
    try {
      if (performance.timing) {
        const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
        metrics.ttfb = {
          name: 'TTFB',
          value: ttfb,
          rating: getRating('ttfb', ttfb),
          delta: 0,
        };
      }
    } catch (e) {
      console.error('Error reading TTFB', e);
    }

    return metrics;
  },

  /**
   * Send metrics to analytics endpoint
   */
  async sendMetrics(endpoint: string = '/api/analytics/vitals'): Promise<void> {
    const metrics = this.getMetrics();
    
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
    } catch (e) {
      console.error('Failed to send metrics', e);
    }
  },

  /**
   * Format report for console display
   */
  printReport(): void {
    const metrics = this.getMetrics();
    
    console.log('%c📊 ASCA PWA Web Vitals Report', 'font-weight: bold; font-size: 14px; color: #1f6b3a;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (metrics.lcp) {
      console.log(`LCP: ${metrics.lcp.value.toFixed(0)}ms [${metrics.lcp.rating}]`);
    }
    if (metrics.cls) {
      console.log(`CLS: ${metrics.cls.value.toFixed(3)} [${metrics.cls.rating}]`);
    }
    if (metrics.ttfb) {
      console.log(`TTFB: ${metrics.ttfb.value.toFixed(0)}ms [${metrics.ttfb.rating}]`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  },
};

/**
 * Determine rating for metric
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },      // milliseconds
    cls: { good: 0.1, poor: 0.25 },       // unitless
    fid: { good: 100, poor: 300 },        // milliseconds
    ttfb: { good: 600, poor: 1800 },      // milliseconds
  };

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'needs-improvement';

  return value <= threshold.good ? 'good' : value <= threshold.poor ? 'needs-improvement' : 'poor';
}
