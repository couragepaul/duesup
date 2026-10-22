import type { Subscription } from '../subscription';
import { annualCostCents, monthlyCostCents, spendTotals } from '../totals';

const sub = (overrides: Partial<Subscription>): Subscription => ({
  id: 'id',
  name: 'Test',
  amountCents: 1000,
  currency: 'CAD',
  interval: 'month',
  intervalCount: 1,
  startDate: '2026-01-01',
  categoryId: null,
  notes: null,
  reminderDaysBefore: 3,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('annualCostCents', () => {
  test.each([
    ['monthly', sub({ amountCents: 1299 }), 15588],
    ['yearly', sub({ amountCents: 9999, interval: 'year' }), 9999],
    ['quarterly', sub({ amountCents: 3000, intervalCount: 3 }), 12000],
    ['weekly', sub({ amountCents: 700, interval: 'week' }), 36525],
  ])('%s', (_, subscription, expected) => {
    expect(annualCostCents(subscription)).toBe(expected);
  });
});

describe('monthlyCostCents', () => {
  test('converts a yearly price to a monthly average', () => {
    expect(monthlyCostCents(sub({ amountCents: 12000, interval: 'year' }))).toBe(1000);
  });
});

describe('spendTotals', () => {
  test('adds active subscriptions in the home currency', () => {
    const totals = spendTotals(
      [sub({ amountCents: 1000 }), sub({ amountCents: 12000, interval: 'year' })],
      'CAD',
    );
    expect(totals).toEqual({ monthlyCents: 2000, annualCents: 24000, count: 2 });
  });

  test('skips inactive subscriptions and other currencies', () => {
    const totals = spendTotals(
      [sub({ amountCents: 1000 }), sub({ amountCents: 5000, isActive: false }), sub({ amountCents: 900, currency: 'USD' })],
      'CAD',
    );
    expect(totals).toEqual({ monthlyCents: 1000, annualCents: 12000, count: 1 });
  });

  test('is zero for no subscriptions', () => {
    expect(spendTotals([], 'CAD')).toEqual({ monthlyCents: 0, annualCents: 0, count: 0 });
  });
});
