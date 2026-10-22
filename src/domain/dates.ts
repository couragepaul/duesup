import type { IsoDate } from './subscription';

/**
 * Calendar date helpers that never touch the device time zone.
 *
 * All arithmetic is done in UTC, so "2026-03-08" stays "2026-03-08" no matter
 * where the user is or whether a daylight-saving change happens that day.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface CalendarDate {
  year: number;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
}

export function parseIsoDate(value: IsoDate): CalendarDate {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`);
  }
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (date.month < 1 || date.month > 12 || date.day < 1 || date.day > daysInMonth(date.year, date.month)) {
    throw new Error(`Invalid date "${value}".`);
  }
  return date;
}

export function formatIsoDate({ year, month, day }: CalendarDate): IsoDate {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Today's calendar date on the device. */
export function today(): IsoDate {
  const now = new Date();
  return formatIsoDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

function toUtcMs(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function fromUtcMs(ms: number): CalendarDate {
  const d = new Date(ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUtcMs(toUtcMs(date) + days * MS_PER_DAY);
}

/**
 * Adds months, clamping to the last day of the target month.
 * Jan 31 + 1 month = Feb 28 (or Feb 29 in a leap year).
 */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const monthIndex = date.month - 1 + months;
  const year = date.year + Math.floor(monthIndex / 12);
  const month = (((monthIndex % 12) + 12) % 12) + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/** Whole days from `a` to `b`. Negative when `b` is before `a`. */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / MS_PER_DAY);
}

/** Whole calendar months from `a` to `b`, ignoring the day of month. */
export function monthsBetween(a: CalendarDate, b: CalendarDate): number {
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return toUtcMs(a) - toUtcMs(b);
}
