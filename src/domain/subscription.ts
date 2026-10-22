/**
 * Core domain types for DuesUp.
 *
 * Conventions:
 * - Money is stored as integer minor units (cents) to avoid floating-point
 *   rounding errors. $12.99 is stored as 1299.
 * - Calendar dates are plain "YYYY-MM-DD" strings with no time zone. A billing
 *   date is a calendar fact, not a moment in time, so it must not shift when
 *   the user changes time zones.
 * - IDs are generated on the device, so a subscription has a stable identity
 *   before it is ever synced.
 */

/** A calendar date in ISO format, e.g. "2026-10-21". */
export type IsoDate = string;

export type BillingInterval = 'day' | 'week' | 'month' | 'year';

export interface Subscription {
  id: string;
  name: string;

  /** Price per billing cycle, in minor units (cents). */
  amountCents: number;
  /** ISO 4217 currency code, e.g. "CAD". */
  currency: string;

  /** Billing cycle: every `intervalCount` `interval`s, e.g. every 3 months. */
  interval: BillingInterval;
  intervalCount: number;

  /**
   * The first billing date. This is the source of truth for every future
   * renewal date, which is always calculated from it.
   */
  startDate: IsoDate;

  categoryId: string | null;
  notes: string | null;

  /** Days before a renewal to send a reminder. null means no reminder. */
  reminderDaysBefore: number | null;

  /** false when the user has cancelled it but wants to keep the history. */
  isActive: boolean;

  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/** The fields a user fills in when adding or editing a subscription. */
export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;
