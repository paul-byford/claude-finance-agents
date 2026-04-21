# claude-finance-agents

A series of production-pattern agent builds for financial services operations, using the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview), [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro), and [Claude Code](https://code.claude.com/docs/en/overview).

Each build maps to a domain tested by the [Claude Certified Architect (CCA) Foundations](https://www.anthropic.com/news/claude-partner-network) exam and applies it to a real financial services use case. 

The result is a working reference implementation that demonstrates how agentic AI systems connect to the operational reality of asset management: trade processing, NAV reconciliation, exception handling, regulatory document extraction, and client operations.

## Why this exists

[Anthropic's Academy courses](https://www.anthropic.com/learn) teach Claude development concepts. The CCA exam tests practical architectural judgement. There is no worked path between the two.

This repository is that path. It documents the full journey from "completed the courses" to "can design and ship production-grade agent systems," with every implementation decision grounded in a financial services context that makes the patterns commercially relevant rather than academic.

## What gets built

The project follows a deliberate sequence. Each build depends on the one before it.

### Build 0: Environment and Claude Code

**CCA domains:** Claude Code Configuration & Workflows

Project scaffold, CLAUDE.md configuration hierarchy, path-specific rules in `.claude/rules/`, and initial TypeScript setup. Establishes the Claude Code working environment that all subsequent builds run through.

### Build 1: CI/CD integration with Claude Code

**CCA domains:** Claude Code Configuration & Workflows, Prompt Engineering & Structured Output

Automated code review pipeline using Claude Code in non-interactive mode (`-p` flag). Structured output via `--output-format json` with `--json-schema` for machine-parseable review findings. Multi-pass review architecture: per-file analysis plus cross-file integration pass.

This pipeline then reviews every PR for Builds 2 through 5, providing longitudinal experience with the patterns the exam tests.

### Build 2: Structured data extraction from financial documents

**CCA domains:** Prompt Engineering & Structured Output, Context Management & Reliability

Extraction pipeline for trade confirmations, NAV statements, and fund fact sheets using the Claude API with `tool_use` and JSON schemas. Covers schema design (required vs optional fields, nullable fields to prevent hallucination, enum + "other" patterns), `tool_choice` configuration, validation-retry loops with error feedback, few-shot examples for varied document formats, and batch processing via the Message Batches API.

### Build 3: MCP server for financial data operations

**CCA domains:** Tool Design & MCP Integration

Custom MCP server exposing financial data tools: trade lookup, position checking, counterparty validation, exception logging. Focuses on tool description design to prevent misrouting between similar tools, structured error responses with the `isError` flag pattern (`errorCategory`, `isRetryable`, human-readable descriptions), and tool distribution principles.

### Build 4: Single-agent client operations with escalation logic

**CCA domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

Customer operations agent using the Claude Agent SDK for an asset management operations context. Implements the agentic loop lifecycle (`stop_reason` handling), programmatic prerequisite hooks (blocking settlement processing until counterparty verification completes), `PostToolUse` hooks for data normalisation, and escalation logic with explicit criteria and few-shot examples.

### Build 5: Multi-agent reconciliation system

**CCA domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

Coordinator agent delegating to specialised subagents for trade data retrieval, position data retrieval, reconciliation logic, and exception reporting. Covers hub-and-spoke architecture, isolated subagent context, parallel subagent spawning via multiple `Task` tool calls, iterative refinement loops, context management across agents, information provenance preservation, and conflicting data handling with source attribution.

## Architecture

```
src/
  agents/          # Agent implementations (Claude Agent SDK)
  mcp-servers/     # Custom MCP server implementations
  tools/           # Tool definitions and JSON schemas
  types/           # Shared TypeScript types (Trade, Position, NAV, etc.)
  utils/           # Shared utilities (structured errors, data normalisation)
docs/              # Build log and learning notes
data/              # Sample financial documents for extraction testing
```

### Claude Code configuration

The project uses the full CLAUDE.md hierarchy and path-specific rules that the CCA exam tests:

```
CLAUDE.md                          # Project-level conventions
.claude/rules/testing.md           # Glob-scoped: **/*.test.ts
.claude/rules/agents.md            # Glob-scoped: src/agents/**/*
.claude/rules/mcp-servers.md       # Glob-scoped: src/mcp-servers/**/*
.mcp.json                          # Project-scoped MCP server config
```

Rules load conditionally based on which files are being edited, reducing irrelevant context and token usage.

## Tech stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **Agent SDK:** `@anthropic-ai/claude-agent-sdk`
- **API SDK:** `@anthropic-ai/sdk` (direct API usage for extraction pipelines)
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Schema validation:** Zod
- **Testing:** Vitest
- **Development:** Claude Code as the primary development environment

## Getting started

### Prerequisites

- Node.js 20 or later
- An Anthropic API key
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)

### Setup

```bash
git clone https://github.com/paul-byford/claude-finance-agents.git
cd claude-finance-agents
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Commands

```bash
npm run build        # Compile TypeScript
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run typecheck    # Type check without emitting
npm run dev          # Run in development mode
```

## Financial domain model

The shared type system covers the core data structures that flow through all agent builds:

- **Trade** and **Position** types for trade lifecycle and portfolio state
- **NavStatement** with line items for fund valuation
- **Counterparty** with KYC status and LEI identifiers
- **ReconciliationBreak** with severity levels and resolution tracking
- **ExtractionResult** with field-level confidence scores
- **EscalationSummary** with structured handoff data for human review
- **StructuredError** implementing the MCP `isError` pattern with error categories and retry flags

## Build log

Implementation notes and learning observations are documented in `docs/` as each build progresses. These capture the specific architectural decisions, tradeoffs encountered, and patterns that proved important in practice, particularly where they diverge from what the documentation alone would suggest.

## Context

This project is part of a broader specialisation in the Claude AI ecosystem for financial services - focusing on asset management. It was built using Claude Code as the primary development environment, preparing for the Claude Certified Architect (Foundations) certification while establishing practical implementation expertise that applies directly to enterprise financial services deployments.

Built by [Paul Byford](https://www.linkedin.com/in/paulbyford/), an AI engineer working in financial services technology across asset management, banking, and capital markets.

## Licence

MIT
