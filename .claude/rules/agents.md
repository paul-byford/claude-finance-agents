---
globs: "src/agents/**/*"
---

# Agent Rules

## Agentic loop control flow

Always drive the agentic loop from `stop_reason`. Never infer loop state from anything else.

Handle every `stop_reason` value explicitly:

| `stop_reason`    | Required action                                                  |
|------------------|------------------------------------------------------------------|
| `tool_use`       | Execute all tool calls in the response, then send results back   |
| `end_turn`       | Loop is complete -- process the final message                    |
| `max_tokens`     | Response was truncated -- treat as an error, do not process output |
| `stop_sequence`  | A sentinel was hit -- handle according to the sequence's contract |

```ts
while (true) {
  const response = await client.messages.create(params)

  if (response.stop_reason === 'max_tokens') {
    throw new AgentError('Response truncated before completion', { response })
  }

  if (response.stop_reason === 'end_turn') {
    return extractFinalResult(response)
  }

  if (response.stop_reason === 'tool_use') {
    const toolResults = await executeTools(response.content)
    params.messages.push({ role: 'assistant', content: response.content })
    params.messages.push({ role: 'user', content: toolResults })
    continue
  }

  throw new AgentError(`Unhandled stop_reason: ${response.stop_reason}`, { response })
}
```

Never fall through on an unrecognised `stop_reason`. Throw a typed error so the caller can decide how to recover.

## No natural language loop termination

Never inspect message text to decide whether the loop should stop. Do not regex-match, substring-search, or otherwise parse assistant output for words like "done", "complete", "finished", or "no further action required".

Natural language is non-deterministic. A model rephrasing its conclusion will silently break any text-based termination check.

If you need an explicit termination signal, define a dedicated tool:

```ts
// Good: termination is a typed, programmatic event
const completeTool = {
  name: 'complete_reconciliation',
  description: 'Call this when reconciliation is finished and all discrepancies are resolved.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      discrepancyCount: { type: 'number' },
    },
    required: ['summary', 'discrepancyCount'],
  },
}
```

Detect termination by checking whether the model called that tool, not by reading its text.

## Programmatic hooks for business rule enforcement

Business rules -- position limits, exposure caps, credit checks, compliance gates, settlement cutoffs -- must be enforced in tool implementations. They must never be enforced solely through a system prompt.

A prompt is instructions. A tool implementation is a guarantee. Prompts can be ignored, misread, or overridden by later context. Code cannot.

```ts
// Wrong: relies on the model choosing not to exceed the limit
systemPrompt: 'Never approve a trade that exceeds $10M notional.'

// Right: the tool rejects the call before it reaches any downstream system
async function submitTrade(input: TradeInput): Promise<TradeResult> {
  if (input.notional > NOTIONAL_LIMIT) {
    throw new ComplianceError('Trade exceeds notional limit', {
      limit: NOTIONAL_LIMIT,
      submitted: input.notional,
    })
  }
  ...
}
```

Validate tool inputs with Zod at the boundary. Return typed error responses when a business rule is violated. Never return a plain string error that the agent might reinterpret or retry around.

Use the prompt to describe what the agent should try to do. Use tool code to enforce what the agent is allowed to do.

## Subagent context isolation

Each subagent invocation must be fully self-contained. Pass all required context as explicit typed parameters. Never rely on the parent agent's conversation history, module-level state, or ambient variables being visible to the subagent.

```ts
// Wrong: assumes the subagent can read the parent's messages array
const result = await runSubagent({ task: 'validate positions' })

// Right: everything the subagent needs is passed explicitly
const result = await runSubagent({
  task: 'validate positions',
  positions: currentPositions,
  valuationDate: run.valuationDate,
  tolerances: VALIDATION_TOLERANCES,
})
```

Define a typed input and output contract for every subagent. Use `zod` to parse the subagent's structured output before trusting it.

Do not share mutable state between agents via closure or module scope. Each agent run is an isolated unit -- if two agents write to the same object, the result is undefined.

Scope each subagent's system prompt to its specific task. A subagent that validates positions does not need to know the broader reconciliation workflow, the run ID, or the operator's identity. Narrow prompts reduce hallucination surface area.

Exclude sensitive data from subagent context unless that subagent explicitly requires it. If a subagent only needs position quantities, do not pass account numbers or counterparty names. Treat context minimisation as a security property, not a performance optimisation.
