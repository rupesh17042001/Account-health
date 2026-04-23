export interface HealthStatus {
  label: 'Healthy' | 'At Risk' | 'Critical';
  className: string;
  icon: string;
  color: string;
}

/**
 * Determine health status from a score.
 * Amazon's scale is 0–1000; simplified scale is 0–100.
 */
export function getHealthStatus(score: number, scale: 'amazon' | 'simplified' = 'simplified'): HealthStatus {
  const normalized = scale === 'amazon' ? score / 10 : score;

  if (normalized >= 80) {
    return { label: 'Healthy', className: 'healthy', icon: '●', color: '#22c55e' };
  }
  if (normalized >= 50) {
    return { label: 'At Risk', className: 'at-risk', icon: '▲', color: '#f59e0b' };
  }
  return { label: 'Critical', className: 'critical', icon: '✖', color: '#ef4444' };
}

/**
 * Get the gauge color for a health score (gradient points).
 */
export function getGaugeColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

/**
 * Performance metric thresholds
 */
export const METRIC_THRESHOLDS = {
  odr: {
    target: 1,
    warning: 1,
    critical: 2,
    label: 'Order Defect Rate',
    unit: '%',
    targetLabel: '< 1%',
  },
  ldr: {
    target: 4,
    warning: 4,
    critical: 6,
    label: 'Late Dispatch Rate',
    unit: '%',
    targetLabel: '< 4%',
  },
  cancellationRate: {
    target: 2.5,
    warning: 2.5,
    critical: 4,
    label: 'Cancellation Rate',
    unit: '%',
    targetLabel: '< 2.5%',
  },
} as const;

/**
 * Get metric status color
 */
export function getMetricStatus(value: number, metric: keyof typeof METRIC_THRESHOLDS): {
  color: string;
  status: 'good' | 'warning' | 'critical';
} {
  const threshold = METRIC_THRESHOLDS[metric];
  if (value >= threshold.critical) return { color: '#ef4444', status: 'critical' };
  if (value >= threshold.warning) return { color: '#f59e0b', status: 'warning' };
  return { color: '#22c55e', status: 'good' };
}
