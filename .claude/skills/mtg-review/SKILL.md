---
name: mtg-review
description: Review code changes in the MtgTrader repo (Angular client + .NET API) against this project's own rules (API contracts kept in sync on both sides, Scryfall owning card data, the `{userId}_doubles` list, user ids taken from the JWT, EF migrations, DI lifetimes, client state services) as well as general correctness and security. Use it whenever the user asks to review, check, audit or look over changes, a branch, a diff, a commit or files, before committing, merging or opening a PR ("review my changes", "is this ready to merge?", "can you check what I did?", "relis mon code"), even if they don't say "code review". Reports findings ranked by severity, then offers to fix the ones the user picks.
---

# MtgTrader review

The goal is to catch what the build, the linters and the tests can't: broken project rules, mismatches between the server and the client, and authorization holes. Then report them so the user can decide what to fix. A review is useful when it's right and specific. One confirmed issue with a `file:line` and a concrete fix is worth more than ten vague "consider…" notes.

## 1. Work out what to review

By default, review everything the current branch adds on top of `main`, plus uncommitted work:

- base: `git merge-base main HEAD`
- tracked changes (committed, staged and unstaged): `git diff <base>`
- new files: `git ls-files --others --exclude-standard`

If the user names something narrower, review that instead: uncommitted changes only, staged changes, a commit or range, or a file or folder. If you're on `main` with nothing uncommitted, ask what to review.

State the scope in one line before starting (how many files, server and/or client). Skip generated files: `Migrations/*.Designer.cs`, `ApplicationContextModelSnapshot.cs`, and `package-lock.json` when it changed alongside `package.json`. Do check whether such files *should* have changed, though (see the checklist).

## 2. Load the rules for the areas touched

The project rules live in the repo and are the source of truth:

- `CLAUDE.md` at the root, `server/CLAUDE.md` and `client/CLAUDE.md`
- `.claude/rules/*.md`: each one lists the paths it governs in its `paths:` frontmatter

Read the ones that cover the changed files; they're short. Then read `references/checklist.md` (next to this file), which turns those rules into concrete review questions, area by area. If the checklist and a rule file disagree, the rule file wins. Mention the drift in the report so the checklist gets updated.

## 3. Read each change in context

Read every changed hunk and enough of the surrounding file to understand it. Many of this project's bugs are invisible inside the diff. A server record changes while its TypeScript interface doesn't. A hub event is renamed on one side only. A new handler is registered with the wrong lifetime in a file the diff never touched. Whenever a change has a counterpart on the other side of the API, open the counterpart and compare. That is the most common way this codebase breaks, because nothing generates the client types from the server.

## 4. Run the mechanical checks once

Run the checks only for the side(s) that changed:

- **Server**, from `server/`:
  - `dotnet build MtgTrader.sln -v q`
  - `dotnet test MtgTrader.sln --no-build`. If the test host reports that .NET 8 is missing, set the environment variable `DOTNET_ROLL_FORWARD=Major` for that run.
  - `dotnet format MtgTrader.sln --verify-no-changes --include <changed .cs files>`
- **Client**, from `client/`:
  - `npx eslint <changed .ts/.html files>`
  - `npx ng build --configuration development`
  - `npm test -- --watch=false --browsers=ChromeHeadless`

Report failures as findings, quoting the relevant error lines. The codebase doesn't pass its linters yet, so lint errors on lines the change didn't touch are pre-existing; don't count them against this change. If a check can't run (missing `node_modules`, no browser, missing runtime), say so in the report instead of silently skipping it.

## 5. Review

Go through these in order of importance:

1. **Project rules.** Work through the checklist sections for the areas touched.
2. **Correctness.** Logic errors; edge cases (empty lists, null or undefined, the doubles list); error paths; async mistakes (`.Result` or `.Wait()`, tasks that are never awaited, subscriptions that are never torn down).
3. **Security.** The acting user comes from the JWT. Mutations check that the caller owns what they change. No secrets or hosts are hard-coded. Nothing sends the user's token to a third party.
4. **Tests.** New or changed behaviour in a handler, repository, service or client service should come with tests that follow the conventions in `.claude/rules/server-tests.md` or the existing specs.
5. **Readability.** Only when it actually hurts: misleading names, dead code, or duplicated logic that already exists elsewhere.

Verify every finding before reporting it. Re-read the code, and if needed check the caller or open the counterpart, to confirm the problem is real and that this change introduced or worsened it. If you still aren't sure, report it as a question rather than a defect. Problems that were already there in code the change touches go in a separate "Already there" section, briefly. They're useful context, but they aren't the author's doing and shouldn't block the change.

**Boundaries.**
- A change to something `CLAUDE.md` lists under "Ask first" is not a bug, but it needs the owner's explicit OK. That covers a new npm or NuGet package; JWT validation, the CORS policy or the `api/` match in the auth interceptor; and deployment files. List these under "Needs sign-off".
- An edit to a "Leave alone" file is a blocker. That covers existing migrations, `database/database.sql`, the `ssl/` folders, and a hand-edited `package-lock.json`.

## 6. Report

Use this structure and leave out empty sections:

```markdown
## Review: <scope, e.g. "uncommitted changes, 6 files, server + client">

**Verdict:** <one sentence: ready to merge / fix the blockers first / needs a decision on X>

### Blockers
1. `path/to/File.cs:42`: **<Short title.>** <What's wrong and its concrete consequence.> *Rule:* <source, e.g. server/CLAUDE.md, "take the acting user from the JWT claims">. *Fix:* <the specific change>.

### Should fix
2. ...

### Nits
3. ...

### Needs sign-off
- <boundary item and why it needs the owner's OK>

### Already there (not introduced by this change)
- <one line each>

### Checks
server build ✅ · server tests ✅ 55 passed · dotnet format ❌ (see 4) · client lint ⚠️ not run: node_modules missing
```

Number the findings continuously across sections, so the user can answer "fix 1, 2 and 4". Severity:

- **Blocker**: breaks behaviour, security or data; the two sides of a contract disagree; a "Leave alone" file was edited.
- **Should fix**: breaks a project convention; new logic without tests; a likely future bug.
- **Nit**: style or clarity. Leave the section out if nothing is worth saying.

Keep each finding to two or three sentences. The user can ask for more detail.

## 7. Offer fixes

End the report with: "Want me to fix any of these? Give me the numbers, or say 'all blockers'." Don't change any file until the user has picked.

When fixing:

- Fix both sides of a contract together: the server record, the TypeScript interface, and the specs that build those objects.
- Leave "Leave alone" files untouched. An "Ask first" change still needs an explicit yes.
- For a schema change, generate a new migration with `dotnet ef migrations add <Name> --project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi` instead of writing one by hand.
- Afterwards, re-run the checks for the side you changed and report the result.
