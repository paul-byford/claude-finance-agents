---
globs: "**/*.test.ts,**/*.spec.ts"
---

# Testing Rules

## Test structure

Use `describe` to group tests by the unit under test (function or class name), with nested `describe` blocks for logical sub-groups (e.g. error cases, a specific method).

```ts
describe('reconcilePositions', () => {
  describe('when positions match', () => {
    it('returns an empty discrepancy list', () => { ... })
  })

  describe('when a position is missing', () => {
    it('returns a discrepancy with type MISSING', () => { ... })
  })
})
```

Write test names as plain statements of expected behaviour, not implementation details. Prefer "returns X when Y" or "throws ReconciliationError when Y" over "calls the function".

Each `it` block must test exactly one behaviour. If you need multiple assertions to verify a single outcome, that is fine -- but a single `it` block must not test two unrelated things.

Always follow Arrange-Act-Assert. Put a blank line between each phase when the block is more than a few lines.

```ts
it('calculates net exposure correctly', () => {
  const positions = buildPositions([
    makePosition({ quantity: 100, price: 50 }),
    makePosition({ quantity: -30, price: 50 }),
  ])

  const result = calculateNetExposure(positions)

  expect(result.netQuantity).toBe(70)
  expect(result.notional).toBe(3500)
})
```

## What to test

Cover both success and error paths for every exported function. A test file that only covers the happy path is incomplete.

Test the contract (inputs and outputs), not the implementation. Do not assert on internal state, private methods, or call counts unless the side-effect is the point (e.g. a logger or event emitter).

For Zod schemas, test:
- a valid input that should parse successfully
- an input missing a required field
- an input with a field of the wrong type
- boundary values (empty strings, zero, negative numbers) where the domain has opinions on them

For agent tools, test:
- the tool returns the correct shape when the underlying data source succeeds
- the tool throws a typed error when the data source fails
- any input validation rejects out-of-range or malformed values

For orchestration / multi-step flows, test:
- the full happy-path sequence end-to-end with a lightweight test double
- that a failure in one step does not silently corrupt downstream state

Do not test TypeScript types or compiler behaviour. Do not write tests that only verify a mock was called -- if there is no observable outcome, there is nothing worth testing.

## Mock data and test doubles

Never use raw object literals as mock data. Always use factory functions with sensible financial-domain defaults.

```ts
// src/agents/__fixtures__/positions.ts
export function makePosition(overrides?: Partial<Position>): Position {
  return {
    accountId: 'ACC-001',
    symbol: 'AAPL',
    quantity: 100,
    price: 182.50,
    currency: 'USD',
    settlementDate: '2026-04-28',
    ...overrides,
  }
}
```

Co-locate fixtures with the code they support. Put shared fixtures in `src/__fixtures__/`. Put fixtures only used by one module next to that module.

Use realistic financial values, not placeholder strings. Account IDs should look like account IDs (`ACC-001`, `TRD-20260425-001`). Prices should be plausible numbers. Dates should be real ISO 8601 strings. This makes failures readable and catches formatting bugs that `"foo"` would miss.

For external dependencies (HTTP clients, database clients, the Anthropic SDK), use a typed test double -- a hand-written object that implements the same interface -- rather than a spy or auto-mock. This keeps tests honest about the shape of the dependency.

```ts
const mockTradeRepository: TradeRepository = {
  getByDate: async (_date) => [makePosition()],
  save: async (_trade) => {},
}
```

Never fabricate data that looks like real customer data. Use clearly synthetic identifiers (`ACC-001`, `CUST-TEST-99`).
