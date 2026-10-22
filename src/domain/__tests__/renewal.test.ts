import { daysUntilRenewal, nextRenewalDate, type BillingCycle } from '../renewal';

const monthly = (startDate: string, intervalCount = 1): BillingCycle => ({
  startDate,
  interval: 'month',
  intervalCount,
});

describe('nextRenewalDate', () => {
  test.each([
    // [description, cycle, from, expected]
    ['clamps to the end of a short month', monthly('2026-01-31'), '2026-02-01', '2026-02-28'],
    ['recovers to the 31st after a short month', monthly('2026-01-31'), '2026-03-01', '2026-03-31'],
    ['uses Feb 29 in a leap year', monthly('2028-01-31'), '2028-02-01', '2028-02-29'],
    ['handles quarterly billing with clamping', monthly('2026-01-31', 3), '2026-05-01', '2026-07-31'],
    ['counts a renewal today as due', monthly('2026-09-17'), '2026-10-17', '2026-10-17'],
    ['returns the start date for a future subscription', monthly('2026-12-01'), '2026-10-21', '2026-12-01'],
    ['returns the start date when it is today', monthly('2026-10-21'), '2026-10-21', '2026-10-21'],
    ['crosses a year boundary', monthly('2026-11-15'), '2026-12-16', '2027-01-15'],
  ])('%s', (_, cycle, from, expected) => {
    expect(nextRenewalDate(cycle, from)).toBe(expected);
  });

  test.each([
    ['yearly on a leap day, in a common year', '2024-02-29', '2026-01-01', '2026-02-28'],
    ['yearly on a leap day, in the next leap year', '2024-02-29', '2027-06-01', '2028-02-29'],
    ['yearly, on the anniversary', '2025-06-10', '2026-06-10', '2026-06-10'],
    ['yearly, the day after the anniversary', '2025-06-10', '2026-06-11', '2027-06-10'],
  ])('%s', (_, startDate, from, expected) => {
    expect(nextRenewalDate({ startDate, interval: 'year', intervalCount: 1 }, from)).toBe(expected);
  });

  test.each([
    ['weekly', { interval: 'week', intervalCount: 1 }, '2026-10-21', '2026-10-22'],
    ['every two weeks', { interval: 'week', intervalCount: 2 }, '2026-10-21', '2026-10-29'],
    ['every 30 days', { interval: 'day', intervalCount: 30 }, '2026-10-21', '2026-11-14'],
  ] as const)('%s', (_, partial, from, expected) => {
    expect(nextRenewalDate({ startDate: '2026-10-15', ...partial }, from)).toBe(expected);
  });

  test('is not affected by a daylight-saving change', () => {
    // Canada springs forward on 2027-03-14 and falls back on 2026-11-01.
    expect(nextRenewalDate({ startDate: '2026-10-31', interval: 'day', intervalCount: 1 }, '2026-11-02')).toBe(
      '2026-11-02',
    );
    expect(nextRenewalDate(monthly('2027-02-14'), '2027-03-15')).toBe('2027-04-14');
  });

  test('handles a subscription last seen years ago', () => {
    expect(nextRenewalDate(monthly('2010-01-31'), '2026-10-21')).toBe('2026-10-31');
  });

  test('rejects an invalid interval count', () => {
    expect(() => nextRenewalDate(monthly('2026-01-01', 0), '2026-02-01')).toThrow();
  });

  test('rejects an invalid date', () => {
    expect(() => nextRenewalDate(monthly('2026-02-30'), '2026-03-01')).toThrow();
  });
});

describe('daysUntilRenewal', () => {
  test('is 0 when it renews today', () => {
    expect(daysUntilRenewal(monthly('2026-09-21'), '2026-10-21')).toBe(0);
  });

  test('counts days to the next renewal', () => {
    expect(daysUntilRenewal(monthly('2026-09-24'), '2026-10-21')).toBe(3);
  });
});
