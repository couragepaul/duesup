import {
  addDays,
  addMonths,
  compareDates,
  daysBetween,
  formatIsoDate,
  monthsBetween,
  parseIsoDate,
  type CalendarDate,
} from './dates';
import type { BillingInterval, IsoDate, Subscription } from './subscription';

export interface BillingCycle {
  startDate: IsoDate;
  interval: BillingInterval;
  intervalCount: number;
}

/**
 * Date of the `n`th renewal (n = 0 is the start date).
 *
 * Every renewal is calculated from the start date, never from the previous
 * renewal. Stepping from the previous renewal would make a subscription that
 * started on Jan 31 drift: Feb 28 → Mar 28 → Apr 28. Calculating from the start
 * gives Feb 28 → Mar 31 → Apr 30, which matches how merchants actually bill.
 */
function nthRenewal(start: CalendarDate, cycle: BillingCycle, n: number): CalendarDate {
  const steps = n * cycle.intervalCount;
  switch (cycle.interval) {
    case 'day':
      return addDays(start, steps);
    case 'week':
      return addDays(start, steps * 7);
    case 'month':
      return addMonths(start, steps);
    case 'year':
      return addMonths(start, steps * 12);
  }
}

/** Rough number of whole cycles between two dates, used as a starting guess. */
function estimateCycles(start: CalendarDate, from: CalendarDate, cycle: BillingCycle): number {
  switch (cycle.interval) {
    case 'day':
      return Math.floor(daysBetween(start, from) / cycle.intervalCount);
    case 'week':
      return Math.floor(daysBetween(start, from) / (7 * cycle.intervalCount));
    case 'month':
      return Math.floor(monthsBetween(start, from) / cycle.intervalCount);
    case 'year':
      return Math.floor(monthsBetween(start, from) / (12 * cycle.intervalCount));
  }
}

/**
 * The first renewal date on or after `from`.
 *
 * A renewal that falls on `from` itself counts as due, not as past.
 * If the subscription hasn't started yet, the start date is returned.
 *
 * Runs in constant time: it jumps straight to an estimate rather than stepping
 * through every cycle, so a subscription that hasn't been opened in years
 * costs the same as one opened yesterday.
 */
export function nextRenewalDate(cycle: BillingCycle, from: IsoDate): IsoDate {
  if (!Number.isInteger(cycle.intervalCount) || cycle.intervalCount < 1) {
    throw new Error(`intervalCount must be a positive integer, got ${cycle.intervalCount}.`);
  }

  const start = parseIsoDate(cycle.startDate);
  const target = parseIsoDate(from);

  if (compareDates(start, target) >= 0) {
    return cycle.startDate;
  }

  let n = Math.max(0, estimateCycles(start, target, cycle));
  let candidate = nthRenewal(start, cycle, n);

  // Month-end clamping can leave the estimate one cycle short. Correct forward.
  while (compareDates(candidate, target) < 0) {
    n += 1;
    candidate = nthRenewal(start, cycle, n);
  }

  return formatIsoDate(candidate);
}

/** Whole days from `from` until the next renewal. 0 means it renews today. */
export function daysUntilRenewal(cycle: BillingCycle, from: IsoDate): number {
  return daysBetween(parseIsoDate(from), parseIsoDate(nextRenewalDate(cycle, from)));
}

/** Convenience overload for a full subscription. */
export function nextRenewalForSubscription(subscription: Subscription, from: IsoDate): IsoDate {
  return nextRenewalDate(subscription, from);
}
