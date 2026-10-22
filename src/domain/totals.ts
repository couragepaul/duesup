import type { BillingInterval, Subscription } from './subscription';

/** Average number of billing cycles per year, for a cycle of length 1. */
const CYCLES_PER_YEAR: Record<BillingInterval, number> = {
  day: 365.25,
  week: 365.25 / 7,
  month: 12,
  year: 1,
};

/**
 * Average yearly cost of one subscription, in cents.
 *
 * This is an average, not a forecast: a weekly subscription costs 52 or 53
 * charges depending on the year, and this smooths that out.
 */
export function annualCostCents(subscription: Pick<Subscription, 'amountCents' | 'interval' | 'intervalCount'>): number {
  const cyclesPerYear = CYCLES_PER_YEAR[subscription.interval] / subscription.intervalCount;
  return Math.round(subscription.amountCents * cyclesPerYear);
}

/** Average monthly cost of one subscription, in cents. */
export function monthlyCostCents(subscription: Pick<Subscription, 'amountCents' | 'interval' | 'intervalCount'>): number {
  return Math.round(annualCostCents(subscription) / 12);
}

export interface SpendTotals {
  monthlyCents: number;
  annualCents: number;
  /** Number of active subscriptions counted. */
  count: number;
}

/**
 * Totals across active subscriptions in a single currency.
 *
 * v1 uses one home currency. Subscriptions in other currencies are skipped
 * rather than silently added together, since adding CAD to USD gives a
 * meaningless number. Conversion arrives in v1.1.
 */
export function spendTotals(subscriptions: Subscription[], currency: string): SpendTotals {
  const counted = subscriptions.filter((s) => s.isActive && s.currency === currency);
  const annualCents = counted.reduce((sum, s) => sum + annualCostCents(s), 0);
  return {
    annualCents,
    monthlyCents: Math.round(annualCents / 12),
    count: counted.length,
  };
}

/** Formats cents for display, e.g. 1299 → "$12.99". */
export function formatMoney(cents: number, currency: string, locale = 'en-CA'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
