# claude-finance-agents

Production-grade AI agents for financial services operations, built with the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview), [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro), and [Claude Code](https://code.claude.com/docs/en/overview).

Each build maps to a domain tested by the [Claude Certified Architect (CCA) Foundations](https://www.anthropic.com/news/claude-partner-network) exam and applies it to a real financial services use case: trade processing, NAV reconciliation, exception handling, document extraction, and client operations.

## Why this exists

[Anthropic's Academy courses](https://www.anthropic.com/learn) teach Claude development concepts. The CCA exam tests practical architectural judgement. There is no worked path between the two.

This repository is that path. Each build implements specific agent patterns in a financial services industry context, focusing on the asset management sector. Each build encounters the real tradeoffs the exam tests, and documents what was learned along the way. The financial services contextualisation is deliberate: regulated environments force better architectural decisions around deterministic compliance, structured error handling, multi-source reconciliation, and escalation boundaries.

A structured interpretation of the full CCA exam guide, mapped to each build, is maintained in [`docs/cca-exam-reference.md`](docs/cca-exam-reference.md). It covers all five domains, all six scenarios with key decision points and common distractors, 21 anti-patterns organised by domain, and a quick reference summary.

## What gets built

The project follows a deliberate sequence. Each build depends on the one before it, and the CI/CD pipeline established in Build 1 provides automated review for everything that follows.

### Build 0: Environment and Claude Code fluency

Project scaffold, CLAUDE.md configuration hierarchy, path-specific rules in `.claude/rules/`, and TypeScript setup. Establishes the Claude Code working environment that all subsequent builds run through.

**CCA domains:** Claude Code Configuration & Workflows

### Build 1: CI/CD integration with Claude Code

Automated code review pipeline using Claude Code in non-interactive mode (`-p` flag). Structured output via `--output-format json` with `--json-schema` for machine-parseable review findings. Multi-pass review architecture: per-file analysis plus cross-file integration pass. This pipeline then reviews every PR for Builds 2 through 5.

**CCA domains:** Claude Code Configuration & Workflows, Prompt Engineering & Structured Output

### Build 2: Structured data extraction from financial documents

Extraction pipeline for trade confirmations, NAV statements, and fund fact sheets using the Claude API with `tool_use` and JSON schemas. Covers schema design (required vs optional fields, nullable fields to prevent hallucination, enum + "other" patterns), `tool_choice` configuration, validation-retry loops with error feedback, few-shot examples for varied document formats, and batch processing via the Message Batches API.

**CCA domains:** Prompt Engineering & Structured Output, Context Management & Reliability

### Build 3: MCP server for financial data operations

Custom MCP server exposing financial data tools: trade lookup, position checking, counterparty validation, exception logging. Focuses on tool description design to prevent misrouting between similar tools, structured error responses with the `isError` flag pattern (`errorCategory`, `isRetryable`, human-readable descriptions), and tool distribution principles.

**CCA domains:** Tool Design & MCP Integration

### Build 4: Single-agent client operations with escalation logic

Customer operations agent using the Claude Agent SDK for an asset management operations context. Implements the agentic loop lifecycle (`stop_reason` handling), programmatic prerequisite hooks (blocking settlement processing until counterparty verification completes), `PostToolUse` hooks for data normalisation, and escalation logic with explicit criteria and few-shot examples.

**CCA domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

### Build 5: Multi-agent reconciliation system

Coordinator agent delegating to specialised subagents for trade data retrieval, position data retrieval, reconciliation logic, and exception reporting. Covers hub-and-spoke architecture, isolated subagent context, parallel subagent spawning via multiple `Task` tool calls, iterative refinement loops, context management across agents, information provenance preservation, and conflicting data handling with source attribution.

**CCA domains:** Agentic Architecture & Orchestration, Tool Design & MCP Integration, Context Management & Reliability

## Project structure

```
claude-finance-agents/
├── CLAUDE.md                        # Project-level conventions for Claude Code
├── .claude/
│   └── rules/                       # Path-specific conventions (YAML frontmatter glob patterns)
│       ├── agents.md                # src/agents/**/*
│       ├── mcp-servers.md           # src/mcp-servers/**/*
│       └── testing.md               # **/*.test.ts
├── .mcp.json                        # Project-scoped MCP server configuration
├── src/
│   ├── agents/                      # Agent implementations (Claude Agent SDK)
│   ├── mcp-servers/                 # Custom MCP server implementations
│   ├── tools/                       # Tool definitions and JSON schemas
│   ├── types/                       # Shared TypeScript types (Trade, Position, NAV, etc.)
│   └── utils/                       # Shared utilities (structured errors, data normalisation)
├── docs/
│   └── cca-exam-reference.md        # Structured CCA exam guide interpretation
├── data/                            # Sample financial documents for extraction testing
└── .github/
    └── workflows/                   # CI/CD pipeline (Build 1)
```

The Claude Code configuration uses the full CLAUDE.md hierarchy and path-specific rules that the CCA exam tests. Rules load conditionally based on which files are being edited, reducing irrelevant context and token usage.

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

## CCA exam reference

The [`docs/cca-exam-reference.md`](docs/cca-exam-reference.md) file is a structured interpretation of the [official CCA Foundations exam guide](docs/claude-certified-architect-foundations-exam-guide.pdf), maintained as a working study document alongside the builds. It includes:

- All 5 domains with every task statement mapped to a specific build
- All 6 exam scenarios with key decision points and common distractors
- 21 anti-patterns organised by domain with severity ratings and correct approach pairings
- Sample question answer key with the principle each question tests
- A 12-point quick reference for last-minute review
- Readiness checkboxes for tracking progress against each task statement
- Links to practice resources including community sites and Anthropic Academy

## Build log

Implementation notes and learning observations are documented in `docs/` as each build progresses. These capture the specific architectural decisions, tradeoffs encountered, and patterns that proved important in practice, particularly where they diverge from what the documentation alone would suggest.

## Context

This project is part of a broader specialisation in the Claude AI ecosystem for financial services, focusing on asset management. It was built using Claude Code as the primary development environment, preparing for the Claude Certified Architect (Foundations) certification while establishing practical implementation expertise that applies directly to enterprise financial services deployments.

Built by [Paul Byford](https://www.linkedin.com/in/paulbyford/), an AI engineer working in financial services technology across asset management, banking, and capital markets.

## Licence

MIT