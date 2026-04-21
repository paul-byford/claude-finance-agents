# CCA Foundations: Structured Exam Reference

A working interpretation of the Claude Certified Architect (Foundations) exam guide, mapped to the builds in this project. Use this document to track readiness against each task statement and to identify gaps before sitting the exam.

Source: Claude Certified Architect -- Foundations Certification Exam Guide (Version 0.1, Feb 10 2025)

---

## Exam format

- 60 multiple choice questions, single correct answer per question
- Scenario-based: 4 scenarios selected at random from 6 possible scenarios
- Scaled score 100--1,000, passing score 720
- No penalty for guessing

---

## Domain weightings

| Domain | Weight | Primary builds |
|--------|--------|----------------|
| 1. Agentic Architecture & Orchestration | 27% | Build 4, Build 5 |
| 2. Tool Design & MCP Integration | 18% | Build 3, Build 4, Build 5 |
| 3. Claude Code Configuration & Workflows | 20% | Build 0, Build 1 |
| 4. Prompt Engineering & Structured Output | 20% | Build 1, Build 2 |
| 5. Context Management & Reliability | 15% | Build 2, Build 4, Build 5 |

---

## Exam scenarios

Each scenario presents a realistic production context. During the exam, 4 of the 6 are selected at random. The key decision points below capture the architectural choices the exam is most likely to test for each scenario.

### Scenario 1: Customer Support Resolution Agent

Building a customer support resolution agent using the Claude Agent SDK. Handles returns, billing disputes, account issues via MCP tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`). Target: 80%+ first-contact resolution with appropriate escalation.

**Domains tested:** 1, 2, 5
**Project mapping:** Build 4 (single-agent with escalation logic)

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| How should the agentic loop terminate? | Check `stop_reason`: continue on `"tool_use"`, exit on `"end_turn"` | Parsing assistant text for "done" or "complete" keywords |
| How to enforce a refund limit? | `PreToolUse` hook that programmatically blocks refund calls above threshold and escalates | Adding "never process refunds above $500" to the system prompt |
| When should the agent escalate? | Escalate on: explicit customer request, policy gaps, capability limits, business thresholds | Escalating based on negative sentiment or self-reported low confidence |
| How to preserve customer details in long conversations? | Immutable "case facts" block at the start of context with name, account ID, order, amounts | Progressive summarisation that silently loses critical specifics |

**Exam strategy:** This scenario tests the intersection of agentic architecture and reliability. Focus on hook-based enforcement (not prompts) and case facts (not summarisation). Every escalation question will try to trick you with sentiment-based triggers.

**Readiness:** [ ]

### Scenario 2: Code Generation with Claude Code

Using Claude Code for code generation, refactoring, debugging, documentation. Custom slash commands, CLAUDE.md configurations, plan mode vs direct execution.

**Domains tested:** 3, 5
**Project mapping:** Build 0 (environment setup), Build 1 (CI/CD)

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| Where should team coding standards go? | `.claude/CLAUDE.md` (project-level, version-controlled, shared) | `~/.claude/CLAUDE.md` (user-level, personal only) |
| When to use plan mode vs direct execution? | Plan mode for multi-file architectural changes; direct execution for simple, well-defined fixes | Always using plan mode (wasteful) or never using it (risky for complex changes) |
| How to handle complex refactoring needing isolation? | Use a skill with `context: fork` and `allowed-tools` restrictions | Using a command that runs in the main session context, polluting it |
| Best iterative refinement strategy? | TDD iteration: write failing test, implement, verify, refine | Vague instructions like "make it better" without verification criteria |

**Exam strategy:** This scenario is purely about Claude Code configuration. Know the three configuration layers, when to use commands vs skills, and the TDD iteration pattern. The exam tests whether you put personal preferences in project-level config.

**Readiness:** [ ]

### Scenario 3: Multi-Agent Research System

Coordinator agent delegates to specialised subagents: web search, document analysis, synthesis, report generation. Produces comprehensive cited reports.

**Domains tested:** 1, 2, 5
**Project mapping:** Build 5 (multi-agent reconciliation)

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| What architecture for parallel research? | Hub-and-spoke: coordinator delegates to specialised subagents with isolated contexts | Flat architecture where all agents share global state or full conversation history |
| How to pass context to subagents? | Pass only the context relevant to each subagent's specific task, explicitly in the prompt | Sharing the full coordinator conversation history with every subagent |
| How to handle conflicting data from subagents? | Track provenance (source, confidence, timestamp) and annotate conflicts with attribution | Arbitrarily choosing one result or averaging conflicting values |
| How to handle subagent failures? | Structured error propagation: failure type, what was attempted, partial results, alternatives | Silently returning empty results or generic "operation failed" errors |

**Exam strategy:** This is the hardest scenario. It tests multi-agent patterns deeply. The key traps are: sharing full context with subagents (always wrong), silently dropping failures (always wrong), and ignoring provenance when resolving conflicts.

**Readiness:** [ ]

### Scenario 4: Developer Productivity with Claude

Building developer productivity tools using the Claude Agent SDK. Codebase exploration, legacy system understanding, boilerplate generation. Uses built-in tools (Read, Write, Bash, Grep, Glob) and MCP servers.

**Domains tested:** 2, 3, 1
**Project mapping:** Build 0, Build 1, Build 3

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| Agent has 18 tools and selects the wrong one | Reduce to 4-5 tools per agent, distribute rest across specialised subagents | Making tool descriptions longer, or switching to a larger model |
| Which built-in tool for reading a config file? | `Read` tool (purpose-built for file reading) | `Bash('cat config.json')` -- never use Bash when a dedicated tool exists |
| How to configure project-level MCP servers? | `.mcp.json` with `${ENV_VAR}` for secrets, version-controlled | `~/.claude.json` (personal only) or hardcoding API keys in config |
| `Write` vs `Edit` for modifying an existing file? | `Edit` for targeted changes (preserves unchanged content) | `Write` replaces the entire file -- loses content you didn't include |

**Exam strategy:** This scenario is tool-focused. Memorise the 6 built-in tools and when to use each. The "18 tools" question is almost guaranteed -- always distribute across subagents. Never use Bash when a built-in tool exists.

**Readiness:** [ ]

### Scenario 5: Claude Code for Continuous Integration

Integrating Claude Code into CI/CD pipeline. Automated code reviews, test generation, PR feedback. Structured output, actionable feedback, minimising false positives.

**Domains tested:** 3, 4
**Project mapping:** Build 1 (CI/CD integration)

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| How to run Claude Code in CI? | `-p` flag for non-interactive mode with `--output-format json` | Running in interactive mode or piping commands via stdin |
| How to review code that Claude generated? | Use a separate session for review (fresh context, no confirmation bias) | Same-session self-review where reviewer retains generator's reasoning |
| Nightly code audit: synchronous or batch? | Message Batches API for non-urgent tasks (50% savings, up to 24h) | Synchronous requests for non-urgent tasks (2x cost, no benefit) |
| How to enforce structured review output? | `--json-schema` flag for specific output shape | Parsing unstructured text with regex |

**Exam strategy:** Three facts to memorise: (1) `-p` for non-interactive, (2) never self-review in the same session, (3) Batch API for non-urgent = 50% savings. These three cover most questions in this scenario.

**Readiness:** [ ]

### Scenario 6: Structured Data Extraction

Building a structured data extraction system. Extracts from unstructured documents, validates with JSON schemas, handles edge cases, integrates with downstream systems.

**Domains tested:** 4, 5
**Project mapping:** Build 2 (financial document extraction)

**Key decision points:**

| Decision | Correct approach | Common distractor |
|----------|-----------------|-------------------|
| How to guarantee structured JSON output? | `tool_use` with JSON schema + `tool_choice` forcing a specific tool | Prompting "output as JSON" (not guaranteed) or post-processing with regex |
| Does `tool_use` guarantee correctness? | No -- `tool_use` guarantees structure only. Validate semantics separately with business rules | Assuming `tool_use` output is always correct because it matched the schema |
| What to do when extraction validation fails? | Append specific error details (which field, what's wrong, expected vs actual) and retry | Generic retry: "there were errors, try again" (no signal for correction) |
| How to handle ambiguous document types? | Enum with "other" + detail field; 2-4 few-shot examples covering edge cases | Rigid enum without "other" (forces misclassification of unexpected types) |

**Exam strategy:** The critical concept is that `tool_use` guarantees structure, not semantics. Every question about extraction reliability will test this. Also know that validation retries need specific errors, not generic messages.

**Readiness:** [ ]

---

## Domain 1: Agentic Architecture & Orchestration (27%)

The heaviest domain. Covers the full lifecycle of agentic systems from single-agent loops to multi-agent orchestration.

### Task 1.1: Design and implement agentic loops for autonomous task execution

**Knowledge required:**
- The agentic loop lifecycle: send request to Claude, inspect `stop_reason` (`"tool_use"` vs `"end_turn"`), execute requested tools, return results for next iteration
- How tool results are appended to conversation history so the model can reason about the next action
- The distinction between model-driven decision-making (Claude reasons about which tool to call) and pre-configured decision trees or tool sequences

**Skills tested:**
- Implementing loop control flow: continue on `"tool_use"`, terminate on `"end_turn"`
- Adding tool results to conversation context between iterations
- Avoiding anti-patterns: parsing natural language for loop termination, arbitrary iteration caps as primary stopping mechanism, checking for assistant text content as completion indicator

**Build mapping:** Build 4
**Readiness:** [ ]

### Task 1.2: Orchestrate multi-agent systems with coordinator-subagent patterns

**Knowledge required:**
- Hub-and-spoke architecture: coordinator manages all inter-subagent communication, error handling, information routing
- Subagents operate with isolated context, they do not inherit the coordinator's conversation history automatically
- Coordinator role: task decomposition, delegation, result aggregation, deciding which subagents to invoke based on query complexity
- Risks of overly narrow task decomposition leading to incomplete coverage

**Skills tested:**
- Designing coordinators that dynamically select subagents rather than always routing through the full pipeline
- Partitioning research scope across subagents to minimise duplication
- Implementing iterative refinement loops: coordinator evaluates synthesis, re-delegates with targeted queries until coverage is sufficient
- Routing all subagent communication through the coordinator for observability and consistent error handling

**Build mapping:** Build 5
**Readiness:** [ ]

### Task 1.3: Configure subagent invocation, context passing, and spawning

**Knowledge required:**
- The `Task` tool as the mechanism for spawning subagents; `allowedTools` must include `"Task"` for a coordinator to invoke subagents
- Subagent context must be explicitly provided in the prompt, no automatic inheritance or shared memory
- `AgentDefinition` configuration: descriptions, system prompts, tool restrictions per subagent type
- `fork_session` for creating independent branches from a shared analysis baseline

**Skills tested:**
- Including complete findings from prior agents directly in the subagent's prompt
- Using structured data formats to separate content from metadata (source URLs, document names, page numbers) when passing context between agents
- Spawning parallel subagents by emitting multiple `Task` tool calls in a single coordinator response
- Designing coordinator prompts that specify research goals and quality criteria rather than step-by-step procedures

**Build mapping:** Build 5
**Readiness:** [ ]

### Task 1.4: Implement multi-step workflows with enforcement and handoff patterns

**Knowledge required:**
- The difference between programmatic enforcement (hooks, prerequisite gates) and prompt-based guidance for workflow ordering
- When deterministic compliance is required (e.g., identity verification before financial operations), prompt instructions alone have a non-zero failure rate
- Structured handoff protocols for escalation: customer details, root cause analysis, recommended actions

**Skills tested:**
- Implementing programmatic prerequisites that block downstream tool calls until upstream steps complete (e.g., blocking `process_refund` until `get_customer` returns a verified ID)
- Decomposing multi-concern requests into distinct items, investigating each in parallel, synthesising a unified resolution
- Compiling structured handoff summaries when escalating to human agents

**Build mapping:** Build 4
**Key exam question pattern:** Question 1 (programmatic prerequisite vs prompt instruction for customer verification)
**Readiness:** [ ]

### Task 1.5: Apply Agent SDK hooks for tool call interception and data normalisation

**Knowledge required:**
- `PostToolUse` hooks that intercept tool results for transformation before the model processes them
- `PreToolUse` hooks that intercept outgoing tool calls before execution to enforce compliance rules (e.g., blocking refunds above a threshold)
- The distinction between pre-execution interception (`PreToolUse` for blocking/redirecting) and post-execution transformation (`PostToolUse` for normalising results)
- The distinction between hooks for deterministic guarantees vs prompt instructions for probabilistic compliance

**Skills tested:**
- Implementing `PostToolUse` hooks to normalise heterogeneous data formats (Unix timestamps, ISO 8601, numeric status codes) from different MCP tools
- Implementing `PreToolUse` hooks that block policy-violating actions before execution and redirect to alternative workflows (e.g., human escalation)
- Choosing hooks over prompt-based enforcement when business rules require guaranteed compliance

**Build mapping:** Build 4
**Readiness:** [ ]

### Task 1.6: Design task decomposition strategies for complex workflows

**Knowledge required:**
- When to use fixed sequential pipelines (prompt chaining) vs dynamic adaptive decomposition based on intermediate findings
- Prompt chaining patterns that break reviews into sequential steps (per-file analysis, then cross-file integration pass)
- The value of adaptive investigation plans that generate subtasks based on what is discovered at each step

**Skills tested:**
- Selecting appropriate decomposition patterns: prompt chaining for predictable multi-aspect reviews, dynamic decomposition for open-ended investigation
- Splitting large code reviews into per-file local analysis plus cross-file integration pass to avoid attention dilution
- Decomposing open-ended tasks by first mapping structure, identifying high-impact areas, then creating a prioritised plan that adapts

**Build mapping:** Build 1 (multi-pass review), Build 5 (adaptive decomposition)
**Key exam question pattern:** Question 12 (splitting 14-file PR review into per-file plus cross-file passes)
**Readiness:** [ ]

### Task 1.7: Manage session state, resumption, and forking

**Knowledge required:**
- Named session resumption using `--resume <session-name>`
- `fork_session` for creating independent branches from a shared baseline
- The importance of informing the agent about file changes when resuming sessions
- Why starting a new session with a structured summary is more reliable than resuming with stale tool results

**Skills tested:**
- Using `--resume` with session names across work sessions
- Using `fork_session` for parallel exploration branches
- Choosing between resumption (prior context mostly valid) and fresh start with injected summaries (prior tool results stale)
- Informing a resumed session about specific file changes for targeted re-analysis

**Build mapping:** Build 0 (Claude Code fluency exercises)
**Readiness:** [ ]

---

## Domain 2: Tool Design & MCP Integration (18%)

Covers MCP server design, tool description quality, error handling, and tool distribution.

### Task 2.1: Design effective tool interfaces with clear descriptions and boundaries

**Knowledge required:**
- Tool descriptions are the primary mechanism LLMs use for tool selection; minimal descriptions lead to unreliable selection
- Importance of including input formats, example queries, edge cases, and boundary explanations in descriptions
- Ambiguous or overlapping descriptions cause misrouting (e.g., `analyze_content` vs `analyze_document`)
- System prompt wording can create unintended tool associations via keyword sensitivity

**Skills tested:**
- Writing tool descriptions that clearly differentiate purpose, inputs, outputs, and when to use each tool vs alternatives
- Renaming tools and updating descriptions to eliminate functional overlap
- Splitting generic tools into purpose-specific tools with defined input/output contracts
- Reviewing system prompts for keyword-sensitive instructions that override well-written descriptions

**Build mapping:** Build 3
**Key exam question pattern:** Question 2 (expanding minimal tool descriptions as the most effective first step)
**Readiness:** [ ]

### Task 2.2: Implement structured error responses for MCP tools

**Knowledge required:**
- The MCP `isError` flag pattern for communicating tool failures to the agent
- Distinction between transient errors (timeouts), validation errors (invalid input), business errors (policy violations), and permission errors
- Why uniform error responses ("Operation failed") prevent appropriate recovery decisions
- Difference between retryable and non-retryable errors

**Skills tested:**
- Returning structured error metadata: `errorCategory` (transient/validation/permission), `isRetryable` boolean, human-readable descriptions
- Including `retriable: false` flags and customer-friendly explanations for business rule violations
- Implementing local error recovery within subagents for transient failures, propagating only unresolvable errors to coordinator
- Distinguishing access failures (needing retry decisions) from valid empty results (successful queries with no matches)

**Build mapping:** Build 3, Build 4
**Key exam question pattern:** Question 8 (structured error propagation vs generic status)
**Readiness:** [ ]

### Task 2.3: Distribute tools appropriately across agents and configure tool choice

**Knowledge required:**
- Giving an agent too many tools (e.g., 18 instead of 4-5) degrades tool selection reliability
- Agents with tools outside their specialisation tend to misuse them
- Scoped tool access: giving agents only the tools needed for their role
- `tool_choice` options: `"auto"`, `"any"`, forced tool selection (`{"type": "tool", "name": "..."}`)

**Skills tested:**
- Restricting each subagent's tool set to role-relevant tools
- Replacing generic tools with constrained alternatives
- Providing scoped cross-role tools for high-frequency needs (e.g., `verify_fact` for synthesis agent)
- Using forced tool selection to ensure a specific tool is called first, then processing subsequent steps in follow-up turns
- Setting `tool_choice: "any"` to guarantee the model calls a tool rather than returning text

**Build mapping:** Build 4, Build 5
**Key exam question pattern:** Question 9 (scoped `verify_fact` tool for synthesis agent)
**Readiness:** [ ]

### Task 2.4: Integrate MCP servers into Claude Code and agent workflows

**Knowledge required:**
- MCP server scoping: project-level (`.mcp.json`) for shared team tooling vs user-level (`~/.claude.json`) for personal servers
- Environment variable expansion in `.mcp.json` (e.g., `${GITHUB_TOKEN}`) for credential management
- Tools from all configured MCP servers are discovered at connection time and available simultaneously
- MCP resources as a mechanism for exposing content catalogues to reduce exploratory tool calls

**Skills tested:**
- Configuring shared MCP servers in project-scoped `.mcp.json` with environment variable expansion
- Configuring personal MCP servers in user-scoped `~/.claude.json`
- Enhancing MCP tool descriptions to prevent the agent preferring built-in tools over more capable MCP tools
- Choosing community MCP servers over custom implementations for standard integrations
- Exposing content catalogues as MCP resources

**Build mapping:** Build 0 (configuration), Build 3 (implementation)
**Readiness:** [ ]

### Task 2.5: Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively

**Knowledge required:**
- Grep for content search (file contents for patterns)
- Glob for file path pattern matching (finding files by name/extension)
- Read/Write for full file operations; Edit for targeted modifications using unique text matching
- When Edit fails due to non-unique matches, use Read + Write as fallback

**Skills tested:**
- Selecting Grep for searching code content across a codebase
- Selecting Glob for finding files matching naming patterns (e.g., `**/*.test.tsx`)
- Using Read + Write when Edit cannot find unique anchor text
- Building codebase understanding incrementally: Grep to find entry points, Read to follow imports
- Tracing function usage across wrapper modules

**Build mapping:** Build 0 (Claude Code fluency)
**Readiness:** [ ]

---

## Domain 3: Claude Code Configuration & Workflows (20%)

Covers CLAUDE.md hierarchy, custom commands, skills, path-specific rules, plan mode, and CI/CD integration.

### Task 3.1: Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organisation

**Knowledge required:**
- CLAUDE.md hierarchy: user-level (`~/.claude/CLAUDE.md`), project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`), directory-level (subdirectory `CLAUDE.md` files)
- User-level settings apply only to that user, not shared via version control
- `@import` syntax for referencing external files to keep CLAUDE.md modular
- `.claude/rules/` directory for topic-specific rule files as alternative to monolithic CLAUDE.md

**Skills tested:**
- Diagnosing configuration hierarchy issues (e.g., new team member missing instructions because they're in user-level not project-level)
- Using `@import` to selectively include relevant standards files per package
- Splitting large CLAUDE.md into focused files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`)
- Using `/memory` command to verify which memory files are loaded

**Build mapping:** Build 0
**Readiness:** [ ]

### Task 3.2: Create and configure custom slash commands and skills

**Knowledge required:**
- Project-scoped commands in `.claude/commands/` (shared via version control) vs user-scoped in `~/.claude/commands/` (personal)
- Skills in `.claude/skills/` with `SKILL.md` supporting frontmatter: `context: fork`, `allowed-tools`, `argument-hint`
- `context: fork` runs skills in isolated sub-agent context, preventing output from polluting the main conversation
- Personal skill customisation in `~/.claude/skills/` with different names

**Skills tested:**
- Creating project-scoped slash commands in `.claude/commands/`
- Using `context: fork` to isolate verbose or exploratory skill output
- Configuring `allowed-tools` in skill frontmatter to restrict tool access
- Using `argument-hint` to prompt for required parameters
- Choosing between skills (on-demand) and CLAUDE.md (always-loaded)

**Build mapping:** Build 0, Build 1
**Key exam question pattern:** Question 4 (project-scoped commands in `.claude/commands/`)
**Readiness:** [ ]

### Task 3.3: Apply path-specific rules for conditional convention loading

**Knowledge required:**
- `.claude/rules/` files with YAML frontmatter `paths` fields containing glob patterns
- Path-scoped rules load only when editing matching files, reducing irrelevant context and token usage
- Glob-pattern rules advantage over directory-level CLAUDE.md for conventions spanning multiple directories

**Skills tested:**
- Creating `.claude/rules/` files with YAML frontmatter path scoping (e.g., `paths: ["terraform/**/*"]`)
- Using glob patterns for type-based conventions regardless of directory (e.g., `**/*.test.tsx`)
- Choosing path-specific rules over subdirectory CLAUDE.md when conventions must apply across the codebase

**Build mapping:** Build 0
**Key exam question pattern:** Question 6 (glob-scoped rules for test files spread across codebase)
**Readiness:** [ ]

### Task 3.4: Determine when to use plan mode vs direct execution

**Knowledge required:**
- Plan mode: complex tasks with large-scale changes, multiple valid approaches, architectural decisions
- Direct execution: simple, well-scoped changes (single-file bug fix)
- Plan mode enables safe exploration before committing to changes
- Explore subagent for isolating verbose discovery output

**Skills tested:**
- Selecting plan mode for architectural tasks (microservice restructuring, library migrations, choosing between integration approaches)
- Selecting direct execution for clear-scope changes (single-file bug fix with clear stack trace)
- Using Explore subagent for verbose discovery to prevent context window exhaustion
- Combining plan mode for investigation with direct execution for implementation

**Build mapping:** Build 0
**Key exam question pattern:** Question 5 (plan mode for monolith-to-microservices restructuring)
**Readiness:** [ ]

### Task 3.5: Apply iterative refinement techniques for progressive improvement

**Knowledge required:**
- Concrete input/output examples as the most effective way to communicate expected transformations
- Test-driven iteration: write tests first, iterate by sharing test failures
- The interview pattern: having Claude ask questions before implementing
- When to provide all issues in one message (interacting problems) vs sequentially (independent problems)

**Skills tested:**
- Providing 2-3 concrete input/output examples to clarify requirements
- Writing test suites covering expected behaviour, edge cases, performance before implementation
- Using the interview pattern for unfamiliar domains
- Addressing interacting issues in a single message, independent issues sequentially

**Build mapping:** Build 1 (iterating on review prompt), Build 2 (iterating on extraction)
**Readiness:** [ ]

### Task 3.6: Integrate Claude Code into CI/CD pipelines

**Knowledge required:**
- The `-p` (or `--print`) flag for non-interactive mode in automated pipelines
- `--output-format json` and `--json-schema` for structured CI output
- CLAUDE.md as the mechanism for providing project context to CI-invoked Claude Code
- Session context isolation: same session that generated code is less effective at reviewing its own changes

**Skills tested:**
- Running Claude Code in CI with `-p` flag
- Using `--output-format json` with `--json-schema` for machine-parseable findings
- Including prior review findings in context on re-review, reporting only new or unaddressed issues
- Providing existing test files in context so test generation avoids duplicates
- Documenting testing standards in CLAUDE.md to improve CI test generation quality

**Build mapping:** Build 1
**Key exam question pattern:** Question 10 (`-p` flag for non-interactive mode)
**Readiness:** [ ]

---

## Domain 4: Prompt Engineering & Structured Output (20%)

Covers precision prompting, few-shot examples, JSON schema enforcement, validation loops, batch processing, and multi-pass review.

### Task 4.1: Design prompts with explicit criteria to improve precision and reduce false positives

**Knowledge required:**
- Explicit criteria over vague instructions ("flag comments only when claimed behaviour contradicts actual code behaviour" vs "check that comments are accurate")
- General instructions like "be conservative" or "only report high-confidence findings" fail to improve precision
- High false positive rates in some categories undermine confidence in accurate categories

**Skills tested:**
- Writing specific review criteria defining which issues to report vs skip
- Temporarily disabling high false-positive categories while improving prompts
- Defining explicit severity criteria with concrete code examples per level

**Build mapping:** Build 1
**Readiness:** [ ]

### Task 4.2: Apply few-shot prompting to improve output consistency and quality

**Knowledge required:**
- Few-shot examples as the most effective technique for consistent output when instructions alone fail
- Few-shot examples demonstrate ambiguous-case handling
- Few-shot examples enable generalisation to novel patterns
- Few-shot examples reduce hallucination in extraction tasks

**Skills tested:**
- Creating 2-4 targeted few-shot examples for ambiguous scenarios showing reasoning
- Including examples demonstrating specific desired output format
- Providing examples distinguishing acceptable patterns from genuine issues
- Using examples to demonstrate correct handling of varied document structures
- Adding examples to address empty/null extraction of required fields

**Build mapping:** Build 1 (review output), Build 2 (extraction), Build 4 (escalation criteria)
**Readiness:** [ ]

### Task 4.3: Enforce structured output using tool use and JSON schemas

**Knowledge required:**
- `tool_use` with JSON schemas as the most reliable approach for guaranteed schema-compliant output
- Distinction between `tool_choice: "auto"` (may return text), `"any"` (must call a tool, can choose which), forced selection (must call specific tool)
- Strict JSON schemas eliminate syntax errors but not semantic errors (line items that don't sum, values in wrong fields)
- Schema design: required vs optional fields, enum with "other" + detail string for extensible categories

**Skills tested:**
- Defining extraction tools with JSON schemas and extracting data from `tool_use` response
- Setting `tool_choice: "any"` for guaranteed structured output with multiple schemas and unknown document type
- Forcing a specific tool with `tool_choice: {"type": "tool", "name": "extract_metadata"}`
- Designing optional (nullable) fields when source documents may lack information, preventing fabrication
- Adding enum values like `"unclear"` for ambiguous cases and `"other"` + detail fields

**Build mapping:** Build 2
**Readiness:** [ ]

### Task 4.4: Implement validation, retry, and feedback loops for extraction quality

**Knowledge required:**
- Retry-with-error-feedback: appending specific validation errors to prompt on retry
- Retries are ineffective when information is absent from source (vs format/structural errors)
- Feedback loop design: tracking which code constructs trigger findings (`detected_pattern` field)
- Difference between semantic validation errors (values don't sum) and schema syntax errors (eliminated by tool use)

**Skills tested:**
- Implementing follow-up requests with original document, failed extraction, and specific validation errors
- Identifying when retries will be ineffective (missing information) vs effective (format mismatches)
- Adding `detected_pattern` fields for false positive analysis
- Designing self-correction flows: extracting `calculated_total` alongside `stated_total`, adding `conflict_detected` booleans

**Build mapping:** Build 2
**Readiness:** [ ]

### Task 4.5: Design efficient batch processing strategies

**Knowledge required:**
- Message Batches API: 50% cost savings, up to 24-hour processing window, no guaranteed latency SLA
- Appropriate for non-blocking latency-tolerant workloads (overnight reports, weekly audits), inappropriate for blocking workflows (pre-merge checks)
- Batch API does not support multi-turn tool calling within a single request
- `custom_id` fields for correlating batch request/response pairs

**Skills tested:**
- Matching API approach to latency requirements: synchronous for blocking, batch for overnight
- Calculating batch submission frequency based on SLA constraints
- Handling batch failures: resubmitting only failed documents (by `custom_id`) with modifications
- Using prompt refinement on a sample set before batch-processing large volumes

**Build mapping:** Build 1 (nightly analysis), Build 2 (batch extraction)
**Key exam question pattern:** Question 11 (batch for overnight reports, synchronous for pre-merge)
**Readiness:** [ ]

### Task 4.6: Design multi-instance and multi-pass review architectures

**Knowledge required:**
- Self-review limitations: model retains reasoning context from generation, less likely to question own decisions
- Independent review instances (without prior reasoning context) more effective than self-review
- Multi-pass review: per-file local analysis plus cross-file integration passes

**Skills tested:**
- Using a second independent Claude instance to review generated code
- Splitting multi-file reviews into per-file passes plus integration passes
- Running verification passes with self-reported confidence for calibrated review routing

**Build mapping:** Build 1
**Key exam question pattern:** Question 12 (per-file plus cross-file review passes)
**Readiness:** [ ]

---

## Domain 5: Context Management & Reliability (15%)

Covers context window optimisation, escalation patterns, error propagation, codebase exploration, human review workflows, and information provenance.

### Task 5.1: Manage conversation context to preserve critical information across long interactions

**Knowledge required:**
- Progressive summarisation risks: condensing numbers, percentages, dates into vague summaries
- "Lost in the middle" effect: models process beginning and end reliably but may omit middle sections
- Tool results accumulate in context disproportionately to relevance (40+ fields when only 5 are relevant)
- Importance of passing complete conversation history in subsequent API requests

**Skills tested:**
- Extracting transactional facts into a persistent "case facts" block outside summarised history
- Extracting structured issue data into a separate context layer for multi-issue sessions
- Trimming verbose tool outputs to relevant fields before accumulation
- Placing key findings summaries at the beginning of aggregated inputs
- Requiring subagents to include metadata in structured outputs for accurate downstream synthesis
- Modifying upstream agents to return structured data instead of verbose reasoning chains

**Build mapping:** Build 4, Build 5
**Readiness:** [ ]

### Task 5.2: Design effective escalation and ambiguity resolution patterns

**Knowledge required:**
- Appropriate escalation triggers: customer requests for human, policy exceptions/gaps, inability to progress
- Distinction between escalating immediately on customer demand vs offering to resolve straightforward issues
- Sentiment-based escalation and self-reported confidence scores are unreliable proxies for case complexity
- Multiple customer matches require clarification (requesting additional identifiers) not heuristic selection

**Skills tested:**
- Adding explicit escalation criteria with few-shot examples to system prompt
- Honouring explicit customer requests for human agents immediately
- Acknowledging frustration while offering resolution, escalating only if customer reiterates
- Escalating when policy is ambiguous or silent on the customer's specific request
- Asking for additional identifiers when tool results return multiple matches

**Build mapping:** Build 4
**Key exam question pattern:** Question 3 (explicit escalation criteria vs sentiment analysis vs confidence scores)
**Readiness:** [ ]

### Task 5.3: Implement error propagation strategies across multi-agent systems

**Knowledge required:**
- Structured error context (failure type, attempted query, partial results, alternatives) enables intelligent coordinator recovery
- Distinction between access failures (timeouts needing retry) and valid empty results (no matches)
- Generic error statuses hide valuable context from the coordinator
- Silently suppressing errors or terminating entire workflows on single failures are both anti-patterns

**Skills tested:**
- Returning structured error context to enable coordinator recovery
- Distinguishing access failures from valid empty results
- Having subagents implement local recovery for transient failures, propagating only unresolvable errors
- Structuring synthesis output with coverage annotations indicating gaps from unavailable sources

**Build mapping:** Build 5
**Key exam question pattern:** Question 8 (structured error context vs generic status vs suppression vs termination)
**Readiness:** [ ]

### Task 5.4: Manage context effectively in large codebase exploration

**Knowledge required:**
- Context degradation in extended sessions: inconsistent answers, referencing "typical patterns" instead of specific discovered classes
- Role of scratchpad files for persisting key findings across context boundaries
- Subagent delegation for isolating verbose exploration output
- Structured state persistence for crash recovery: agents export state to known locations

**Skills tested:**
- Spawning subagents to investigate specific questions while main agent preserves coordination
- Having agents maintain scratchpad files recording key findings
- Summarising findings from one phase before spawning subagents for the next
- Designing crash recovery using structured agent state exports (manifests)
- Using `/compact` to reduce context usage during extended sessions

**Build mapping:** Build 5
**Readiness:** [ ]

### Task 5.5: Design human review workflows and confidence calibration

**Knowledge required:**
- Aggregate accuracy metrics (e.g., 97% overall) may mask poor performance on specific document types or fields
- Stratified random sampling for measuring error rates in high-confidence extractions
- Field-level confidence scores calibrated using labelled validation sets
- Importance of validating accuracy by document type and field before automating

**Skills tested:**
- Implementing stratified random sampling of high-confidence extractions
- Analysing accuracy by document type and field for consistent performance
- Having models output field-level confidence scores, calibrating thresholds with labelled data
- Routing low-confidence or ambiguous extractions to human review

**Build mapping:** Build 2
**Readiness:** [ ]

### Task 5.6: Preserve information provenance and handle uncertainty in multi-source synthesis

**Knowledge required:**
- Source attribution is lost during summarisation when findings are compressed without claim-source mappings
- Structured claim-source mappings must be preserved through synthesis
- Conflicting statistics from credible sources: annotate conflicts with attribution rather than selecting one
- Temporal data: require publication/collection dates to prevent misinterpreted contradictions

**Skills tested:**
- Requiring subagents to output structured claim-source mappings preserved through synthesis
- Structuring reports distinguishing well-established from contested findings
- Completing analysis with conflicting values included and explicitly annotated
- Requiring publication/data collection dates in structured outputs
- Rendering different content types appropriately in synthesis (financial data as tables, news as prose)

**Build mapping:** Build 5
**Readiness:** [ ]

---

## Sample question answer key

Quick reference for the sample questions in the exam guide.

| Question | Scenario | Correct | Key principle |
|----------|----------|---------|---------------|
| Q1 | Customer Support | A | Programmatic prerequisites for deterministic compliance |
| Q2 | Customer Support | B | Tool descriptions as primary mechanism for tool selection |
| Q3 | Customer Support | A | Explicit escalation criteria with few-shot examples |
| Q4 | Claude Code | A | Project-scoped commands in `.claude/commands/` |
| Q5 | Claude Code | A | Plan mode for architectural decisions |
| Q6 | Claude Code | A | `.claude/rules/` with glob patterns for cross-directory conventions |
| Q7 | Multi-Agent | B | Coordinator task decomposition too narrow |
| Q8 | Multi-Agent | A | Structured error context for intelligent recovery |
| Q9 | Multi-Agent | A | Scoped cross-role tools (least privilege) |
| Q10 | CI/CD | A | `-p` flag for non-interactive mode |
| Q11 | CI/CD | A | Batch for overnight, synchronous for blocking |
| Q12 | CI/CD | A | Per-file plus cross-file multi-pass review |

---

## Anti-patterns by domain

The exam consistently presents anti-patterns as plausible distractors. Recognising them quickly eliminates 2-3 wrong answers per question. Organised by domain with severity and the correct approach paired alongside each anti-pattern.

### Domain 1: Agentic Architecture (5 patterns)

| Severity | Anti-pattern | Why it fails | Correct approach |
|----------|-------------|-------------|-----------------|
| Critical | Parsing natural language for loop termination | Text content is for the user, not control flow. The model may phrase completion differently each time | Check `stop_reason` field: `"tool_use"` vs `"end_turn"` |
| Critical | Arbitrary iteration caps as primary stopping mechanism | May cut off mid-task or allow pointless looping. Does not reflect task completion | Let the agentic loop terminate naturally via `stop_reason` |
| Critical | Prompt-based enforcement for critical business rules | Prompts are probabilistic. The model can and will sometimes ignore critical instructions | Use programmatic hooks (`PreToolUse`/`PostToolUse`) for deterministic enforcement |
| High | Sentiment-based escalation to human agents | An angry customer with a simple request does not need a human. Sentiment does not equal task complexity | Escalate based on policy gaps, capability limits, explicit requests, or business thresholds |
| High | Self-reported confidence scores for decision-making | Model confidence scores are not well-calibrated and cannot be relied upon for production decisions | Use structured criteria and programmatic checks for escalation decisions |

### Domain 2: Tool Design & MCP (6 patterns)

| Severity | Anti-pattern | Why it fails | Correct approach |
|----------|-------------|-------------|-----------------|
| Critical | Generic error messages ("Operation failed") | The agent cannot decide whether to retry, try an alternative, or escalate without details | Return structured errors: `isError`, `errorCategory`, `isRetryable`, and context |
| Critical | Silently returning empty results for access failures | The agent thinks "no results found" when the real problem is "could not even check" | Distinguish access failures (`isError: true`) from genuinely empty results (`isError: false`, empty results array) |
| Critical | Hardcoding API keys in `.mcp.json` | Configuration files are committed to git. Hardcoded secrets get leaked | Use `${ENV_VAR}` environment variable expansion in MCP config |
| High | Giving one agent 18+ tools | Tool selection accuracy degrades rapidly above 5 tools. Similar tools create ambiguity | Keep 4-5 tools per agent. Distribute the rest across specialised subagents |
| High | Using `Write` when `Edit` is appropriate | `Write` replaces the entire file. Using it on existing files loses content you did not include | Use `Edit` for targeted changes to existing files (preserves unchanged content) |
| High | Using `Bash` when a dedicated built-in tool exists | `Bash('cat config.json')` bypasses purpose-built tools with better error handling and context integration | Use `Read` for file reading, `Grep` for content search, `Glob` for file finding |

### Domain 3: Claude Code Configuration (3 patterns)

| Severity | Anti-pattern | Why it fails | Correct approach |
|----------|-------------|-------------|-----------------|
| Critical | Same-session self-review in CI/CD pipelines | The reviewer retains the generator's reasoning context, creating confirmation bias | Use separate sessions for code generation and code review |
| High | Using commands for complex tasks that need context isolation | Commands run in the current session context, polluting it with exploration noise | Use skills with `context: fork` and `allowed-tools` restrictions |
| Medium | Putting personal preferences in project-level CLAUDE.md | Personal preferences (editor settings, themes) should not be imposed on the whole team | Use `~/.claude/CLAUDE.md` for personal preferences, `.claude/CLAUDE.md` for team standards |

### Domain 4: Prompt Engineering (3 patterns)

| Severity | Anti-pattern | Why it fails | Correct approach |
|----------|-------------|-------------|-----------------|
| Critical | Vague instructions like "be thorough" or "find all issues" | Leads to over-flagging, false positives, and alert fatigue. Developers stop trusting the tool | Provide explicit, measurable criteria: specific categories to report, concrete severity definitions |
| High | Assuming `tool_use` guarantees semantic correctness | `tool_use` guarantees structure only. Values inside the JSON may still be wrong (line items that don't sum, values in wrong fields) | Validate extracted values after `tool_use` with business rule checks. Schema compliance + semantic validation together |
| High | Generic retry messages ("There were errors, please try again") | Without specific error details, the model has no signal for what to fix | Append specific error details: which field, what was wrong, expected vs actual |

### Domain 5: Context & Reliability (4 patterns)

| Severity | Anti-pattern | Why it fails | Correct approach |
|----------|-------------|-------------|-----------------|
| Critical | Progressive summarisation of critical customer details | Each round of summarisation loses specifics: names, IDs, amounts, dates | Use immutable "case facts" blocks positioned at the start of context |
| Critical | Aggregate accuracy metrics only (e.g., "95% overall") | Aggregate metrics mask per-category failures. Invoices at 70% while receipts at 99% still averages well | Track accuracy per document type and field (stratified metrics) |
| High | No provenance tracking for multi-agent data | When subagents provide conflicting data, there is no way to determine which source to trust | Track source, confidence level, timestamp, and agent ID for all data |
| High | Larger context windows to solve attention problems | Attention dilution is about quality of processing, not capacity. A larger window does not fix inconsistent depth across sections | Split into focused passes (per-file analysis plus cross-file integration) |

---

## Quick reference: 12 facts for last-minute review

The most critical patterns distilled to a scannable list. If you remember nothing else:

1. **Loop control:** continue on `stop_reason: "tool_use"`, terminate on `"end_turn"`. Never parse text.
2. **Business rules with financial consequences:** programmatic hooks, never prompt instructions.
3. **Escalation triggers:** explicit customer request, policy gaps, capability limits, thresholds. Never sentiment. Never self-reported confidence.
4. **Subagent context:** isolated by default. Pass findings explicitly in the prompt. No automatic inheritance.
5. **Tool count per agent:** 4-5 maximum. Distribute the rest across specialised subagents.
6. **Tool descriptions:** primary mechanism for tool selection. Include inputs, examples, edge cases, and boundaries.
7. **Error responses:** structured with `errorCategory`, `isRetryable`, description. Distinguish access failures from empty results.
8. **CI/CD non-interactive mode:** `-p` flag. Structured output via `--output-format json` with `--json-schema`.
9. **Self-review limitation:** separate session for review, never same session that generated the code.
10. **`tool_use` guarantees structure, not semantics.** Always validate extracted values with business rules.
11. **Batch API:** 50% savings, up to 24h processing, no latency SLA. Use for overnight/weekly, never for blocking workflows.
12. **Context preservation:** immutable "case facts" block at the start of context. Never progressively summarise critical details.

---

## Practice resources

In addition to the sample questions in the exam guide and the official practice exam (provided separately by Anthropic), the following community resources offer additional practice:

- **claudecertifications.com:** 25 free practice questions filterable by domain, plus scenario walkthroughs and an anti-patterns cheatsheet. Community-maintained, not affiliated with Anthropic. [Practice questions](https://claudecertifications.com/claude-certified-architect/practice-questions) | [Scenario walkthroughs](https://claudecertifications.com/claude-certified-architect/scenarios) | [Anti-patterns](https://claudecertifications.com/claude-certified-architect/anti-patterns)
- **Anthropic Academy (Skilljar):** 13 free courses covering the foundational concepts tested by the exam. Not exam-specific, but the MCP, Agent SDK, and Claude Code courses map to Domains 1-3. [anthropic.skilljar.com](https://anthropic.skilljar.com/)
- **Anthropic developer documentation:** The authoritative source for Agent SDK, MCP, and Claude Code reference material. [platform.claude.com/docs](https://platform.claude.com/docs)

---

## Out of scope

The following will not appear on the exam:

- Fine-tuning or custom model training
- API authentication, billing, account management
- Detailed language/framework implementation (beyond tool and schema config)
- MCP server deployment (infrastructure, networking, containers)
- Claude internals, training process, model weights
- Constitutional AI, RLHF, safety training
- Embeddings, vector databases
- Computer use (browser automation, desktop interaction)
- Vision/image analysis
- Streaming API or server-sent events
- Rate limiting, quotas, API pricing
- OAuth, API key rotation, authentication protocols
- Cloud provider configurations (AWS, GCP, Azure)
- Performance benchmarking or model comparison
- Prompt caching implementation details
- Token counting algorithms

---

## Preparation exercises from the exam guide

The exam guide includes four hands-on exercises. Track completion here.

### Exercise 1: Build a Multi-Tool Agent with Escalation Logic
Domains: 1, 2, 5
**Covered by:** Build 4
**Status:** [ ]

### Exercise 2: Configure Claude Code for a Team Development Workflow
Domains: 3, 2
**Covered by:** Build 0, Build 1
**Status:** [ ]

### Exercise 3: Build a Structured Data Extraction Pipeline
Domains: 4, 5
**Covered by:** Build 2
**Status:** [ ]

### Exercise 4: Design and Debug a Multi-Agent Research Pipeline
Domains: 1, 2, 5
**Covered by:** Build 5
**Status:** [ ]