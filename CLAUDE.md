# Claude Finance Agents

## Purpose

A series of agent builds for financial services operations. Each agent encapsulates a production-grade capability (data ingestion, reconciliation, reporting, risk checks, MCP integrations, etc.) that can be composed into workflows.

## Project context

- Language: TypeScript, strict mode
- Runtime: Node.js 20+
- Key dependencies: `@anthropic-ai/sdk` (Claude Agent SDK), `zod`
- Dev dependencies: `typescript`, `tsx`, `vitest`, `eslint`

## Architecture

Target directory structure (not yet fully created):

- `src/agents/` — agent implementations and orchestration
- `src/mcp-servers/` — MCP server implementations and adapters
- `src/tools/` — helper CLIs and developer tooling
- `src/types/` — shared TypeScript type definitions
- `src/utils/` — pure utility functions

## Commands

- `npm run build` — compile TypeScript to `dist`
- `npm run typecheck` — type-check without emitting (`tsc --noEmit`)
- `npm run dev` — run with watch (`tsx watch src/index.ts`)
- `npm run test` — run tests once (`vitest run`)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint over `src/`

## How to work in this repo

- Run `npm run typecheck` after every change. Fix all type errors before considering a task done.
- Run `npm run test` before marking any task complete.
- Run `npm run lint` and fix all warnings before committing.
- Ask before creating new top-level directories not listed in Architecture above.
- Use atomic commits scoped to a single concern. Do not bundle unrelated changes.
- Never skip pre-commit hooks or bypass lint/typecheck with `--no-verify`.

## Conventions

**TypeScript**
- `strict: true` is non-negotiable. Never use `any` or `as unknown as X` to silence errors.
- Always use named exports. Never use default exports.
- Always add explicit return types to exported functions and public APIs.
- Use structured error types (typed `Error` subclasses or `Result<T, E>` shapes). Never throw plain strings.

**Naming**
- Files: kebab-case (`data-loader.ts`)
- Types/interfaces: PascalCase (`AgentConfig`)
- Functions/variables: camelCase (`loadConfig`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- MCP tool names: snake_case (`get_account_balance`)

**Testing**
- Co-locate tests next to implementation files (`.test.ts` or `.spec.ts`).
- Always cover both success and error paths.
- Never mock the database or external APIs in integration tests -- use real implementations or test doubles that exercise the same code paths.

**Git**
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## What not to do

- Do not add comments that describe what the code does -- use clear names instead.
- Do not add error handling or validation for cases that cannot happen.
- Do not add features, abstractions, or refactors beyond what the task requires.
- Do not create README or documentation files unless explicitly asked.
- Do not use `console.log` for observability -- use structured logging.
- Do not add backwards-compatibility shims for removed code.

