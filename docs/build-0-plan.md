# Build 0: Environment and Claude Code Fluency

**CCA domains covered:** Domain 3 (Tasks 3.1, 3.2, 3.3, 3.4), Domain 2 (Tasks 2.4, 2.5)
**Estimated time:** 2-3 days
**Prerequisites:** Node.js 20+, an Anthropic API key, a GitHub account

---

## Objective

Set up the local development environment, install and configure Claude Code, and build hands-on familiarity with the Claude Code features that the CCA exam tests. This is not a coding build. It is a configuration and fluency build. Everything you do here establishes the working environment that Builds 1 through 5 run on top of.

By the end of Build 0, you should be able to confidently answer exam questions about CLAUDE.md hierarchy, path-specific rules, plan mode vs direct execution, session management, built-in tool selection, and MCP server configuration.

---

## Phase 1: Local setup (Day 1)

### 1.1 Clone the repository and install dependencies

```bash
git clone https://github.com/paul-byford/claude-finance-agents.git
cd claude-finance-agents
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

Verify the project compiles and the existing test passes:

```bash
npm run typecheck
npm run test
```

The test in `src/utils/errors.test.ts` should pass. This validates that the structured error utilities (which implement the MCP `isError` pattern from CCA Domain 2, Task 2.2) are working correctly.

### 1.2 Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify the installation:

```bash
claude --version
```

If you're on Windows and encounter symlink or PATH issues, check the [Claude Code setup docs](https://code.claude.com/docs/en/overview). You've resolved `nvm-windows` PATH conflicts before, so the pattern will be familiar.

### 1.3 Launch Claude Code in the project

```bash
cd claude-finance-agents
claude
```

Claude Code will automatically load the project-level `CLAUDE.md` from the repository root. This is the first CCA-relevant behaviour to observe: Claude Code reads project context from the directory where you launch it.

**CCA exam relevance:** Task 3.1 tests understanding of the CLAUDE.md configuration hierarchy. The project-level `CLAUDE.md` is loaded automatically for all users who clone the repo. User-level settings in `~/.claude/CLAUDE.md` would apply only to you and would not be shared via version control.

---

## Phase 2: Understanding the configuration hierarchy (Day 1)

These exercises are designed to give you direct experience with the configuration patterns the exam tests. Do each one in Claude Code.

### 2.1 Verify which configuration files are loaded

Run the `/memory` command inside Claude Code:

```
/memory
```

This shows which CLAUDE.md and rules files are currently loaded. You should see the root `CLAUDE.md` and potentially the `.claude/rules/` files depending on which files you have open.

**CCA exam relevance:** Task 3.1 tests the `/memory` command for diagnosing configuration issues across sessions.

### 2.2 Observe path-specific rule loading

Open a test file in your editor (e.g., `src/utils/errors.test.ts`), then ask Claude Code a question about testing conventions. The `.claude/rules/testing.md` file should load automatically because its YAML frontmatter specifies `paths: ["**/*.test.ts", "**/*.spec.ts"]`.

Now open a non-test file (e.g., `src/types/financial.ts`) and ask the same question. The testing rules should not be loaded for this file.

To verify, run `/memory` in each context and compare what's loaded.

**CCA exam relevance:** Task 3.3 tests glob-pattern path scoping. The exam specifically tests this over directory-level CLAUDE.md files for conventions that span multiple directories (like test files spread throughout a codebase). This is directly tested in exam Question 6.

### 2.3 Create a user-level CLAUDE.md

Create a personal configuration file that will not be shared with the team:

```bash
mkdir -p ~/.claude
```

Create `~/.claude/CLAUDE.md` with a simple personal preference, such as:

```markdown
# Personal preferences
- When explaining code, include brief comments about the CCA exam domain being exercised
```

Restart Claude Code and verify via `/memory` that both the project-level and user-level files are loaded.

**CCA exam relevance:** Task 3.1 tests the distinction between user-level (`~/.claude/CLAUDE.md`) and project-level configuration. A common exam anti-pattern is putting personal preferences in project-level config, which imposes them on the whole team.

### 2.4 Examine the .mcp.json configuration

Open `.mcp.json` in the project root. It is currently empty (`{"mcpServers": {}}`). This is the project-scoped MCP server configuration file that would be shared via version control. When you add MCP servers in Build 3, they will be configured here using environment variable expansion for credentials (e.g., `${API_TOKEN}`) to avoid committing secrets.

Personal or experimental MCP servers would go in `~/.claude.json` instead (user-scoped, not version-controlled).

**CCA exam relevance:** Task 2.4 tests MCP server scoping (project vs user level) and the environment variable expansion pattern. The exam anti-pattern is hardcoding API keys in `.mcp.json`.

---

## Phase 3: Plan mode, direct execution, and built-in tools (Day 2)

### 3.1 Try direct execution on a simple task

Ask Claude Code to do something simple and well-scoped:

```
Add a JSDoc comment to the createStructuredError function in src/utils/errors.ts explaining what each error category means
```

This is a clear, single-file change with obvious scope. Direct execution is the correct mode here.

**CCA exam relevance:** Task 3.4 tests when to use direct execution vs plan mode. Direct execution is appropriate for well-understood changes with clear scope. This is tested in exam Question 5.

### 3.2 Try plan mode on a complex task

Now try something architectural. Enter plan mode by prefixing with "plan:" or using the plan mode toggle, then ask:

```
Plan how you would add a new ReconciliationEngine class that takes trade data from one source, position data from another source, compares them, and produces ReconciliationBreak objects for any mismatches. Consider where this should live in the project structure, what interfaces it should implement, and how it should handle partial failures from either data source.
```

Observe how Claude Code explores the codebase, examines existing types, and proposes an approach before making any changes. This is the value of plan mode: safe exploration and design before committing.

Do not implement the plan. The point is to experience the difference between plan mode and direct execution.

**CCA exam relevance:** Task 3.4. Plan mode is designed for tasks with architectural implications, multiple valid approaches, and multi-file modifications. Exam Question 5 tests this with a monolith-to-microservices restructuring scenario.

### 3.3 Use the Explore subagent

During a plan mode session, if Claude Code's exploration generates verbose output, observe whether it uses the Explore subagent to isolate discovery output. If it does not do so automatically, you can ask it to explore a specific question in isolation:

```
Use the Explore subagent to investigate how the financial types in src/types/financial.ts are structured and which types reference each other
```

The Explore subagent runs in a forked context. Its verbose discovery output does not pollute the main conversation, preserving your context window for the actual task.

**CCA exam relevance:** Task 3.4 covers the Explore subagent for isolating verbose discovery and preventing context window exhaustion during multi-phase tasks.

### 3.4 Practice with built-in tools

Ask Claude Code to perform tasks that exercise each built-in tool, and observe which tool it selects:

**Grep** (content search - searching file contents for patterns):
```
Find all places in the codebase where errorCategory is referenced
```

**Glob** (file path matching - finding files by name/extension):
```
Find all TypeScript test files in the project
```

**Read** (full file contents):
```
Show me the contents of src/types/financial.ts
```

**Edit** (targeted modification using unique text matching):
```
In src/utils/errors.ts, change the isAccessFailure function to also treat "business" errors as access failures
```

After running the Edit, revert the change (the function should only treat transient and permission errors as access failures). The point was to see Edit in action.

**CCA exam relevance:** Task 2.5 tests selecting the correct built-in tool for each task. The exam anti-patterns are: using `Bash('cat file')` instead of `Read`, and using `Write` (which replaces the entire file) instead of `Edit` for targeted modifications.

---

## Phase 4: Session management (Day 2)

### 4.1 Named sessions

Start a named session:

```bash
claude --resume build-0-exploration
```

Have a conversation exploring the project structure. Then exit Claude Code and restart with the same session name:

```bash
claude --resume build-0-exploration
```

Your prior conversation context should be available.

**CCA exam relevance:** Task 1.7 covers named session resumption using `--resume <session-name>`.

### 4.2 Understand when to resume vs start fresh

If you modify files between sessions, the prior session's tool results (file contents, search results) are stale. The exam tests the judgement call: if prior context is mostly valid, resume. If prior tool results are stale (you've made significant code changes), starting a new session with a structured summary of prior findings is more reliable.

Try this: after your resumed session, make a change to one of the files you discussed. Resume the session again and ask Claude Code about that file. Notice whether it references the old version or re-reads the file.

**CCA exam relevance:** Task 1.7. The exam tests why starting fresh with injected summaries is sometimes more reliable than resuming with stale tool results.

### 4.3 Try /compact

During a longer session, run:

```
/compact
```

This summarises the conversation history into compressed form, freeing 60-80% of context tokens while preserving key decisions, file paths, and findings. Observe what is preserved and what is lost.

**CCA exam relevance:** Task 5.4 covers using `/compact` to reduce context usage during extended exploration sessions.

---

## Phase 5: Custom commands and skills (Day 2-3)

### 5.1 Create a project-scoped slash command

Create a simple review command that will be available to anyone who clones the repo:

```bash
mkdir -p .claude/commands
```

Create `.claude/commands/review.md`:

```markdown
Review the file at $ARGUMENTS for:
1. Adherence to the naming conventions in CLAUDE.md
2. Proper error handling using structured error types from src/utils/errors.ts
3. Explicit return types on exported functions

Report only issues you are confident about. Do not flag minor style preferences.
```

Test it in Claude Code:

```
/review src/types/financial.ts
```

**CCA exam relevance:** Task 3.2 and exam Question 4. Project-scoped commands in `.claude/commands/` are shared via version control. User-scoped commands in `~/.claude/commands/` are personal. The exam tests this distinction directly.

### 5.2 Create a skill with context: fork

Create a project-scoped skill for codebase analysis that runs in an isolated context:

```bash
mkdir -p .claude/skills
```

Create `.claude/skills/analyse-types/SKILL.md`:

```markdown
---
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
argument-hint: "area to analyse (e.g., 'trade types', 'error handling')"
---

Analyse the project's type system in the specified area. Map the relationships between types, identify any missing or inconsistent patterns, and suggest improvements. Output a structured summary.
```

Test it:

```
/skill analyse-types trade types
```

Observe that the skill runs in a forked context. Its verbose output does not pollute your main conversation.

**CCA exam relevance:** Task 3.2. The `context: fork` frontmatter isolates skills that produce verbose output. The `allowed-tools` frontmatter restricts tool access (in this case, read-only tools only, preventing accidental file modifications). The `argument-hint` prompts the user for required parameters. The exam tests the distinction between skills (on-demand invocation) and CLAUDE.md (always-loaded).

### 5.3 Commit the commands and skills

```bash
git add .claude/commands/ .claude/skills/
git commit -m "feat: add project-scoped review command and analyse-types skill"
```

These are now available to anyone who clones the repo, which is the correct pattern for team-shared tooling.

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

Review the Domain 3 anti-patterns from the exam reference:

- Can you explain why same-session self-review in CI/CD is unreliable? (This becomes directly relevant in Build 1)
- Can you explain why commands are wrong for complex tasks needing context isolation, and skills with `context: fork` are correct?
- Can you explain why personal preferences should not go in project-level CLAUDE.md?

### 6.3 Try the relevant sample questions

From the exam reference sample question answer key, attempt Questions 4, 5, and 6 without looking at the answers:

- **Q4:** Where to create a `/review` slash command available to every developer?
- **Q5:** Which approach for restructuring a monolith into microservices?
- **Q6:** How to ensure Claude applies correct conventions for test files spread across the codebase?

If you get any wrong, re-read the relevant task statement and repeat the corresponding exercise.

---

## Deliverables

By the end of Build 0, your repository should contain:

- [ ] All project scaffold files (already committed: CLAUDE.md, tsconfig, package.json, types, utils, rules)
- [ ] `.claude/commands/review.md` (project-scoped slash command)
- [ ] `.claude/skills/analyse-types/SKILL.md` (skill with `context: fork`)
- [ ] `~/.claude/CLAUDE.md` on your local machine (user-level config, not committed)
- [ ] All dependencies installed and tests passing

---

## What comes next

Build 1 creates the CI/CD pipeline using Claude Code in non-interactive mode. The detailed plan is in `docs/build-1-plan.md`. The pipeline you build there will automatically review every PR for Builds 2 through 5, so the quality of the CLAUDE.md and rules configuration you established here directly affects the quality of automated reviews throughout the rest of the project.