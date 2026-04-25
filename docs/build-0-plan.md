# Build 0: Environment and Claude Code Fluency

**CCA domains covered:** Domain 3 (Tasks 3.1, 3.2, 3.3, 3.4), Domain 2 (Tasks 2.4, 2.5)
**Estimated time:** 2-3 days
**Prerequisites:** Node.js 20+, an Anthropic API key, a GitHub account

---

## Objective

Set up the local development environment from scratch, install and configure Claude Code, and build hands-on familiarity with the Claude Code features that the CCA exam tests. You will create every project file yourself, understanding the purpose and CCA relevance of each one as you go.

By the end of Build 0, you should be able to confidently answer exam questions about CLAUDE.md hierarchy, path-specific rules, plan mode vs direct execution, session management, built-in tool selection, and MCP server configuration.

---

## Documentation landscape

Before diving in, it is worth understanding where the documentation lives and how it is organised. You do not need to read all of this upfront. Each phase below links to the specific pages relevant to that phase. This section is an orientation so you know what exists and where to find it.

### Primary documentation sites

**Claude Code Docs** — [code.claude.com/docs](https://code.claude.com/docs/en/overview)
The main reference for Claude Code: installation, configuration, built-in tools, CLAUDE.md, skills, commands, hooks, sessions, plan mode, CI/CD integration. This is the documentation you will use most heavily in Builds 0 and 1. Key sections:

- [Overview](https://code.claude.com/docs/en/overview) — what Claude Code is, installation for each platform
- [Quickstart](https://code.claude.com/docs/en/quickstart) — first session walkthrough
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) — the agentic loop, built-in tools, context management
- [Best practices](https://code.claude.com/docs/en/best-practices) — context window management, plan mode workflow, CLAUDE.md patterns
- [Configuration reference](https://code.claude.com/docs/en/configuration) — CLAUDE.md hierarchy, `.claude/rules/`, settings
- [Extend Claude Code](https://code.claude.com/docs/en/skills) — skills, commands, hooks, MCP integration
- [What's new](https://code.claude.com/docs/en/whats-new) — weekly digest of new features (Claude Code moves fast; worth scanning)

**Claude API Docs** — [platform.claude.com/docs](https://platform.claude.com/docs)
The reference for building with the Claude API directly: messages API, tool use, JSON schemas, batch processing, streaming. Also hosts the Agent SDK documentation. You will use this heavily from Build 2 onwards. Key sections:

- [Messages API](https://platform.claude.com/docs/en/api/messages) — the core API for sending prompts and receiving responses
- [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — defining tools, `tool_choice`, structured output via `tool_use`
- [Batch API](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — Message Batches API for 50% cost savings on latency-tolerant workloads
- [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview) — the SDK that powers agent builds 4 and 5
- [Agent SDK quickstart](https://platform.claude.com/docs/en/agent-sdk/quickstart) — building your first agent
- [TypeScript SDK reference](https://platform.claude.com/docs/en/agent-sdk/typescript) — full API reference for the Agent SDK

**MCP Documentation** — [modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro)
The specification and guides for the Model Context Protocol. You will use this in Build 3 when building custom MCP servers. Key sections:

- [Introduction](https://modelcontextprotocol.io/docs/getting-started/intro) — what MCP is, architecture, client-server model
- [Building servers](https://modelcontextprotocol.io/docs/develop/build-server) — creating MCP servers with the TypeScript SDK
- [Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — defining tools, descriptions, input schemas
- [Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) — exposing content catalogues to reduce exploratory tool calls

**Anthropic Academy** — [anthropic.skilljar.com](https://anthropic.skilljar.com/)
The 13 free courses covering foundational concepts. Useful as a refresher, but the documentation above is the primary reference for implementation details.

### How documentation maps to builds

| Build | Primary docs | What you need from them |
|-------|-------------|------------------------|
| Build 0 | Claude Code Docs | Installation, CLAUDE.md, rules, plan mode, built-in tools, sessions |
| Build 1 | Claude Code Docs | CI/CD integration (`-p` flag, `--output-format json`, `--json-schema`) |
| Build 2 | Claude API Docs | `tool_use`, `tool_choice`, JSON schemas, Message Batches API |
| Build 3 | MCP Docs, Claude Code Docs | MCP server creation, tool descriptions, `.mcp.json` configuration |
| Build 4 | Agent SDK Docs | Agent loop, hooks (`PreToolUse`/`PostToolUse`), `stop_reason`, subagents |
| Build 5 | Agent SDK Docs | `Task` tool, `allowedTools`, `AgentDefinition`, `fork_session` |

In subsequent build plans, only the specific documentation pages relevant to that build will be listed. This orientation section is not repeated.

---

## Phase 1: Project initialisation and Claude Code installation (Day 1)

**Read first:**
- [Claude Code overview](https://code.claude.com/docs/en/overview) — installation instructions for your platform
- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart) — what to expect on first launch

### 1.1 Create the project

Clone the repository (which at this point contains only the README, the exam reference, and this build plan) and initialise the TypeScript project:

```bash
git clone https://github.com/paul-byford/claude-finance-agents.git
cd claude-finance-agents
```

Initialise the Node.js project:

```bash
npm init -y
```

Edit the generated `package.json` to set `"type": "module"` (for ES module support) and add an `"engines"` field requiring Node.js 20+.

### 1.2 Install dependencies for Build 0

Only install what this build needs. Later builds will add their own dependencies (the Agent SDK in Build 4, the MCP SDK in Build 3, the Anthropic API SDK in Build 2).

For Build 0, you need TypeScript tooling, a test runner, and a schema validation library:

```bash
npm install zod
npm install -D typescript @types/node vitest tsx eslint
```

Add scripts to `package.json`:

```bash
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.dev="tsx watch src/index.ts"
npm pkg set scripts.lint="eslint src/ --ext .ts"
```

### 1.3 Create the TypeScript configuration

Create a `tsconfig.json` with strict mode enabled. This is a deliberate project convention: strict TypeScript catches type errors early and enforces explicit return types, which matters when you're defining tool schemas and agent interfaces in later builds.

Key settings to include: `"strict": true`, ES2022 target, NodeNext module resolution, source maps, and declaration files. Exclude test files from compilation output.

### 1.4 Create the directory structure

Create the source directories needed for Build 0. Directories for later builds (agents, mcp-servers) will be created when those builds start.

```bash
mkdir -p src/types src/utils src/tools
mkdir -p docs data
```

### 1.5 Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify the installation:

```bash
claude --version
```

If you're on Windows and encounter symlink or PATH issues, check the [Claude Code setup docs](https://code.claude.com/docs/en/overview).

### 1.6 Create the environment configuration

Create a `.env.example` file documenting the required environment variables:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Copy it to `.env` and add your actual API key. Create a `.gitignore` that excludes `node_modules/`, `dist/`, `.env`, and other generated files. The `.env` file must never be committed.

**CCA exam relevance:** Task 2.4 tests credential management. The exam anti-pattern is hardcoding API keys in configuration files. Environment variables (and `${ENV_VAR}` expansion in `.mcp.json`) are the correct pattern.

### 1.7 First launch

Launch Claude Code from the project root:

```bash
claude
```

At this point there is no CLAUDE.md yet, so Claude Code loads with default context only. You will create the CLAUDE.md in the next phase and observe the difference it makes.

Commit everything you have created so far:

```bash
git add -A
git commit -m "feat: initialise TypeScript project with dependencies and directory structure"
```

---

## Phase 2: Create the CLAUDE.md configuration hierarchy (Day 1)

**Read first:**
- [CLAUDE.md configuration](https://code.claude.com/docs/en/configuration) — the hierarchy (user, project, directory), `@import` syntax, `.claude/rules/`
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) — how the agentic loop loads configuration and context at startup

### 2.1 Create the project-level CLAUDE.md

Create a `CLAUDE.md` file in the project root. This is the most important configuration file for Claude Code. It is loaded automatically at the start of every session when Claude Code is launched from this directory.

Write the content yourself, covering:

- **Purpose:** what this project is (a series of agent builds for financial services operations)
- **Project context:** TypeScript, Node.js 20+, the key dependencies
- **Architecture:** what each source directory is for
- **Conventions:** TypeScript rules (strict mode, named exports, explicit return types, structured error types), naming conventions (kebab-case files, PascalCase types, camelCase functions, UPPER_SNAKE_CASE constants, snake_case MCP tool names), testing conventions (vitest, co-located test files, test error paths), git conventions (conventional commits)
- **Commands:** the npm scripts available

Restart Claude Code after creating the file. Run `/memory` to verify it is loaded. Ask Claude Code a question about the project conventions and observe that it now has context it did not have in Phase 1.

**CCA exam relevance:** Task 3.1. The project-level CLAUDE.md is shared via version control and applies to all team members. This is the correct location for team-wide standards. User-level settings in `~/.claude/CLAUDE.md` apply only to you.

### 2.2 Create path-specific rules

Create the `.claude/rules/` directory and add rule files for different areas of the codebase. Each rule file uses YAML frontmatter with `paths` fields containing glob patterns to specify when it should load.

Create three rule files:

**`.claude/rules/testing.md`** — scoped to `**/*.test.ts` and `**/*.spec.ts`. Include conventions for test structure (vitest `describe`/`it` blocks, arrange/act/assert), what to test (success paths and all error categories: transient, validation, business rule), and how to write mock data (typed against interfaces in `src/types/`).

**`.claude/rules/agents.md`** — scoped to `src/agents/**/*`. Include conventions for agentic loop control flow (`stop_reason` handling), the prohibition against parsing natural language for loop termination, the requirement for programmatic hooks for business rule enforcement, and subagent context isolation rules.

**`.claude/rules/mcp-servers.md`** — scoped to `src/mcp-servers/**/*`. Include conventions for tool description quality (must include input formats, examples, edge cases, boundaries), structured error responses (`isError` flag, `errorCategory`, `isRetryable`), and tool count limits (4-5 per agent).

These rules do not just document conventions. They encode the CCA exam patterns you will be tested on. Writing them now means Claude Code will enforce them when you build the actual agents and MCP servers in later builds.

### 2.3 Verify path-specific rule loading

Test that the rules load conditionally. Open or reference a test file and run `/memory` to see which rules are loaded. Then reference a non-test file and run `/memory` again. The testing rules should appear only when test files are in context.

**CCA exam relevance:** Task 3.3 and exam Question 6. Glob-pattern path scoping is tested over directory-level CLAUDE.md files for conventions that must apply to files spread across multiple directories (like test files co-located with source throughout the codebase).

### 2.4 Create a user-level CLAUDE.md

Create a personal configuration file at `~/.claude/CLAUDE.md` with a simple personal preference. This file is not committed to version control and applies only to your sessions.

After creating it, restart Claude Code and verify via `/memory` that both the project-level and user-level files are loaded.

**CCA exam relevance:** Task 3.1. The exam anti-pattern is putting personal preferences in project-level config. The distinction between user-level (`~/.claude/CLAUDE.md`, personal) and project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`, team-shared) is directly tested.

### 2.5 Create the MCP server configuration

Create an empty `.mcp.json` file in the project root:

```json
{
  "mcpServers": {}
}
```

This is the project-scoped MCP server configuration that will be populated in Build 3. It is version-controlled and shared with the team. When you add MCP servers later, credentials will use environment variable expansion (e.g., `${API_TOKEN}`) rather than hardcoded values.

Personal or experimental MCP servers would go in `~/.claude.json` instead (user-scoped, not version-controlled).

**CCA exam relevance:** Task 2.4 tests MCP server scoping (project vs user level) and credential management via environment variable expansion.

Commit:

```bash
git add -A
git commit -m "feat: add CLAUDE.md, path-specific rules, and MCP config"
```

---

## Phase 3: Create the shared types and utilities (Day 1-2)

**Read first:**
- [Best practices](https://code.claude.com/docs/en/best-practices) — plan mode workflow (the four-phase pattern: explore, plan, implement, verify), context window management
- [Built-in tools overview](https://code.claude.com/docs/en/how-claude-code-works) — introduction to the agentic loop and built-in tools
- [Built-in tools reference](https://code.claude.com/docs/en/tools-reference) — detailed reference for Read, Write, Edit, Bash, Grep, Glob and when to use each

This phase serves two purposes: you create the foundational types and utilities that all later builds depend on, and you practice using Claude Code's different modes and built-in tools while doing so.

### 3.1 Create the financial domain types using plan mode

Enter plan mode and ask Claude Code to help you design the type system for the project. Describe the financial domain: trades (with sides, quantities, prices, settlement dates, counterparties, statuses), positions (instrument holdings with market values), NAV statements (fund valuations with line items), counterparties (with KYC status and LEI identifiers), reconciliation breaks (mismatches between data sources with severity levels), and escalation summaries (structured handoff data for human review).

Let Claude Code explore the domain, propose a type structure, and discuss the design with you before creating any files. This is the value of plan mode: safe exploration and design before committing to changes.

Once you are satisfied with the plan, switch to direct execution and create `src/types/financial.ts` with the agreed types. Create a barrel export in `src/types/index.ts`.

**CCA exam relevance:** Task 3.4 and exam Question 5. Plan mode is designed for tasks with architectural implications and multiple valid approaches. Direct execution is appropriate for well-scoped changes (like creating a file from an agreed design). The exam tests the judgement of when to use each.

### 3.2 Create the structured error utilities using direct execution

This is a simple, well-scoped task: create `src/utils/errors.ts` with utility functions for the MCP structured error pattern. You need:

- A `StructuredError` interface (if not already in your types) with `errorCategory` (transient/validation/permission/business), `isRetryable` boolean, `description` string, and optional `details`
- A `createStructuredError` function that creates error objects, automatically setting `isRetryable` to `true` for transient errors and `false` for everything else
- A `formatMcpError` function that wraps a structured error in the MCP response format with the `isError: true` flag
- An `isAccessFailure` type guard that distinguishes access failures (transient, permission) from valid empty results (validation, business)

Use direct execution for this. The scope is clear, the design is straightforward, and there is no architectural ambiguity.

**CCA exam relevance:** Domain 2, Task 2.2. The distinction between access failures and valid empty results is critical. The exam anti-pattern is silently returning empty results for access failures, which prevents the agent from making appropriate recovery decisions.

### 3.3 Write the first test

Create `src/utils/errors.test.ts` with tests covering:

- Transient errors are marked as retryable
- Validation and business errors are not retryable
- The MCP error format includes the `isError: true` flag
- `isAccessFailure` correctly identifies transient and permission errors as access failures
- `isAccessFailure` correctly identifies validation and business errors as non-access failures

Create a `vitest.config.ts` if you have not already. Run the tests and verify they pass.

**CCA exam relevance:** The testing rules you created in Phase 2 should now load automatically when you're working on this test file. Verify via `/memory` that the testing conventions from `.claude/rules/testing.md` are active.

### 3.4 Practice with built-in tools

Now that you have real files in the project, practice using Claude Code's built-in tools by asking it to perform tasks that exercise each one. Observe which tool it selects:

**Grep** (content search — searching file contents for patterns):
```
Find all places in the codebase where errorCategory is referenced
```

**Glob** (file path matching — finding files by name/extension):
```
Find all TypeScript test files in the project
```

**Read** (full file contents):
```
Show me the contents of src/types/financial.ts
```

**Edit** (targeted modification using unique text matching):
```
In src/utils/errors.ts, add a JSDoc comment to the createStructuredError function
```

After observing Edit, also try asking Claude Code to make a change that would require Write (creating a new file) vs Edit (modifying an existing one).

**CCA exam relevance:** Task 2.5. The exam anti-patterns are: using `Bash('cat file')` instead of Read, and using Write (which replaces the entire file) instead of Edit for targeted modifications.

Commit:

```bash
git add -A
git commit -m "feat: add financial domain types and structured error utilities with tests"
```

---

## Phase 4: Session management (Day 2)

**Read first:**
- [Sessions and context](https://code.claude.com/docs/en/sessions) — named sessions, `--resume`, `/compact`, context window lifecycle

### 4.1 Named sessions

Start a named session:

```bash
claude --resume build-0-exploration
```

Have a conversation exploring the project structure you have built so far. Ask about the types, the error utilities, how they relate to each other. Then exit Claude Code and restart with the same session name:

```bash
claude --resume build-0-exploration
```

Your prior conversation context should be available. Observe what is preserved.

**CCA exam relevance:** Task 1.7 covers named session resumption using `--resume <session-name>`.

### 4.2 Understand when to resume vs start fresh

Make a change to one of the files you discussed in the previous session (e.g., add a new type to `financial.ts`). Resume the session and ask Claude Code about the file. Notice whether it references the old version or re-reads it.

The exam tests this judgement call: if prior context is mostly valid, resume. If prior tool results are stale (significant code changes), starting a new session with a structured summary of prior findings is more reliable.

**CCA exam relevance:** Task 1.7. The exam tests why starting fresh with injected summaries is sometimes more reliable than resuming with stale tool results.

### 4.3 Try /compact

During a longer session, run:

```
/compact
```

This summarises the conversation history into compressed form, freeing 60-80% of context tokens while preserving key decisions, file paths, and findings. Observe what is preserved and what is lost.

**CCA exam relevance:** Task 5.4 covers using `/compact` to reduce context usage during extended exploration sessions.

### 4.4 Try the Explore subagent

Ask Claude Code to perform a verbose exploration task in isolation:

```
Use the Explore subagent to investigate how the financial types in src/types/financial.ts are structured and which types reference each other
```

The Explore subagent runs in a forked context. Its verbose discovery output does not pollute the main conversation, preserving your context window for the actual task.

**CCA exam relevance:** Task 3.4 covers the Explore subagent for isolating verbose discovery and preventing context window exhaustion during multi-phase tasks.

---

## Phase 5: Custom commands and skills (Day 2-3)

**Read first:**
- [Skills documentation](https://code.claude.com/docs/en/skills) — SKILL.md structure, frontmatter options (`context: fork`, `allowed-tools`, `argument-hint`), project vs personal skills, the difference between skills and commands
- [Extend Claude Code](https://code.claude.com/docs/en/skills) — overview of all extension mechanisms (skills, commands, hooks, MCP) and when to use each

### 5.1 Create a project-scoped slash command

Create a simple review command that will be available to anyone who clones the repo:

```bash
mkdir -p .claude/commands
```

Create `.claude/commands/review.md` with instructions for reviewing a file against the project's conventions. The command should accept a file path via `$ARGUMENTS`, check adherence to naming conventions from CLAUDE.md, verify proper error handling using the structured error types, and check for explicit return types on exported functions. Include an instruction to report only confident findings and skip minor style preferences.

Test it in Claude Code:

```
/review src/types/financial.ts
```

**CCA exam relevance:** Task 3.2 and exam Question 4. Project-scoped commands in `.claude/commands/` are shared via version control. User-scoped commands in `~/.claude/commands/` are personal. The exam tests this distinction directly.

### 5.2 Create a skill with context: fork

Create a project-scoped skill for codebase analysis that runs in an isolated context:

```bash
mkdir -p .claude/skills/analyse-types
```

Create `.claude/skills/analyse-types/SKILL.md` with YAML frontmatter specifying:
- `context: fork` — to run in an isolated sub-agent context
- `allowed-tools` — restricted to `Read`, `Grep`, and `Glob` (read-only, preventing accidental modifications)
- `argument-hint` — prompting for the area to analyse

The skill body should instruct Claude to analyse the project's type system in the specified area, map relationships between types, and output a structured summary.

Test it:

```
/skill analyse-types trade types
```

Observe that the skill runs in a forked context. Its verbose output does not pollute your main conversation.

**CCA exam relevance:** Task 3.2. The `context: fork` frontmatter isolates verbose skill output. The `allowed-tools` frontmatter restricts tool access. The `argument-hint` prompts for parameters. The exam tests the distinction between skills (on-demand invocation) and CLAUDE.md (always-loaded), and the anti-pattern of using commands when skills with `context: fork` are needed for context isolation.

### 5.3 Commit

```bash
git add -A
git commit -m "feat: add project-scoped review command and analyse-types skill"
```

---

## Phase 6: Review and self-assessment (Day 3)

### 6.1 Check readiness against exam reference

Open `docs/cca-exam-reference.md` and review the following task statements. For each one, ask yourself whether you could answer a scenario-based exam question testing this pattern. Mark the readiness checkbox if yes.

**Domain 3 tasks covered by Build 0:**
- [ ] Task 3.1: CLAUDE.md hierarchy, scoping, modular organisation, `/memory` command
- [ ] Task 3.2: Custom slash commands and skills, `context: fork`, `allowed-tools`, `argument-hint`
- [ ] Task 3.3: Path-specific rules with YAML frontmatter glob patterns
- [ ] Task 3.4: Plan mode vs direct execution, Explore subagent

**Domain 2 tasks partially covered by Build 0:**
- [ ] Task 2.4: MCP server scoping (project vs user level), environment variable expansion (configuration only, implementation in Build 3)
- [ ] Task 2.5: Built-in tool selection (Read, Write, Edit, Bash, Grep, Glob)

**Domain 1 tasks partially covered by Build 0:**
- [ ] Task 1.7: Session resumption, `/compact` (partial coverage, deeper session management in later builds)

### 6.2 Verify anti-patterns

Review the anti-patterns from the exam reference for Domains 2 and 3:

- Can you explain why same-session self-review in CI/CD is unreliable? (This becomes directly relevant in Build 1)
- Can you explain why commands are wrong for complex tasks needing context isolation, and skills with `context: fork` are correct?
- Can you explain why personal preferences should not go in project-level CLAUDE.md?
- Can you explain why hardcoding API keys in `.mcp.json` is wrong, and what to use instead?
- Can you explain the difference between an access failure and a valid empty result?

### 6.3 Try the relevant sample questions

From the exam reference sample question answer key, attempt Questions 4, 5, and 6 without looking at the answers:

- **Q4:** Where to create a `/review` slash command available to every developer?
- **Q5:** Which approach for restructuring a monolith into microservices?
- **Q6:** How to ensure Claude applies correct conventions for test files spread across the codebase?

If you get any wrong, re-read the relevant task statement and repeat the corresponding exercise.

---

## Deliverables

By the end of Build 0, your repository should contain everything you created during this build:

- [ ] `package.json` with dependencies and scripts
- [ ] `tsconfig.json` with strict mode
- [ ] `.env.example` and `.gitignore`
- [ ] `CLAUDE.md` (project-level conventions)
- [ ] `.claude/rules/testing.md` (glob-scoped to test files)
- [ ] `.claude/rules/agents.md` (glob-scoped to agent code)
- [ ] `.claude/rules/mcp-servers.md` (glob-scoped to MCP server code)
- [ ] `.mcp.json` (empty, project-scoped MCP config)
- [ ] `src/types/financial.ts` and `src/types/index.ts` (domain types)
- [ ] `src/utils/errors.ts` (structured error utilities)
- [ ] `src/utils/errors.test.ts` (tests passing)
- [ ] `vitest.config.ts`
- [ ] `.claude/commands/review.md` (project-scoped slash command)
- [ ] `.claude/skills/analyse-types/SKILL.md` (skill with `context: fork`)
- [ ] `~/.claude/CLAUDE.md` on your local machine (user-level config, not committed)

---

## What comes next

Build 1 creates the CI/CD pipeline using Claude Code in non-interactive mode. The detailed plan will be in `docs/build-1-plan.md`. The pipeline you build there will automatically review every PR for Builds 2 through 5, so the quality of the CLAUDE.md and rules configuration you created here directly affects the quality of automated reviews throughout the rest of the project.