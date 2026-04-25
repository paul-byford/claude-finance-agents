---
globs: "src/mcp-servers/**/*"
---

# MCP Server Rules

## Tool count limits

Each MCP server must expose 4-5 tools maximum. If you find yourself adding a sixth tool, that is a signal the server has too broad a responsibility and should be split.

A model's ability to select the right tool degrades as the tool list grows. Fewer, well-named tools with clear boundaries outperform many tools with overlapping purposes.

Group tools by the resource they operate on, not by the operation type. A server that owns `trade` data should expose trade tools. A server that owns `position` data should expose position tools. Do not mix resource domains in a single server.

## Tool description quality

Every tool description must give the model enough information to call it correctly without trial and error. A description that only says what the tool does is incomplete.

Each tool description must include:

**What it does** -- one sentence, plain English, no jargon.

**Input formats** -- every non-obvious field needs a format note inline in the description or in the parameter's own `description` field.

```ts
{
  name: 'get_trades_by_date',
  description: `Returns all trades settled on a given date.
    settlementDate must be ISO 8601 format (YYYY-MM-DD), e.g. 2026-04-25.
    Returns trades for the current business day if settlementDate is omitted.`,
  inputSchema: {
    type: 'object',
    properties: {
      settlementDate: {
        type: 'string',
        description: 'ISO 8601 date string (YYYY-MM-DD). Defaults to today.',
      },
    },
  },
}
```

**At least one example** -- show a realistic call with realistic financial values, not placeholder strings.

**Edge cases and boundaries** -- state what happens at the limits: empty result sets, date ranges that span weekends or holidays, zero-quantity positions, accounts with no history. If the tool has a maximum result count, state it.

```ts
description: `Returns open positions for an account as of the valuation date.
  accountId format: ACC-NNNNNN (e.g. ACC-001234).
  valuationDate: ISO 8601 (YYYY-MM-DD). Defaults to the latest available date.
  Returns an empty positions array if the account has no open positions -- this is not an error.
  Returns at most 500 positions per call. Use the pageToken field to paginate.
  Raises a NOT_FOUND error if the accountId does not exist.`
```

Never write a description that a reader would have to guess at. If you are uncertain how to describe a boundary, that is a sign the boundary is not well defined in the implementation -- define it first.

## Structured error responses

All tool errors must return a structured response object, never a plain string and never a thrown exception that surfaces as an unformatted stack trace.

Every error response must include:

- `isError: true` -- lets the agent distinguish errors from empty-but-valid results without parsing text
- `errorCategory` -- a stable, uppercase string constant the agent can branch on programmatically
- `isRetryable` -- boolean; tells the agent whether calling the same tool again (with the same or adjusted inputs) could succeed

```ts
type ToolErrorResponse = {
  isError: true
  errorCategory: ErrorCategory
  isRetryable: boolean
  message: string
  details?: Record<string, unknown>
}

type ErrorCategory =
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'BUSINESS_RULE_VIOLATION'
```

Use `isRetryable` deliberately:
- `NOT_FOUND` and `INVALID_INPUT` are not retryable -- the same call will produce the same result.
- `RATE_LIMITED` and `UPSTREAM_UNAVAILABLE` are retryable -- a later call may succeed.
- `BUSINESS_RULE_VIOLATION` is not retryable -- the agent should surface this to the operator, not loop.

```ts
// Example: account not found
return {
  isError: true,
  errorCategory: 'NOT_FOUND',
  isRetryable: false,
  message: 'Account ACC-999999 does not exist.',
  details: { accountId: 'ACC-999999' },
}

// Example: upstream system temporarily unavailable
return {
  isError: true,
  errorCategory: 'UPSTREAM_UNAVAILABLE',
  isRetryable: true,
  message: 'Trade repository did not respond within the timeout window.',
  details: { timeoutMs: 5000 },
}
```

Include a `details` object whenever the error has structured context the agent could act on -- the failing field name, the violated limit, the attempted value. Do not embed structured data inside the `message` string.

Success responses must never include `isError`. Do not return `isError: false` on success -- the absence of the flag is the signal.
