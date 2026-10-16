---
name: mtg-commit
description: Commit one finished ticket from `.scratch/` as a Conventional Commit, then close the ticket with that commit's hash in a follow-up commit.
disable-model-invocation: true
argument-hint: "[ticket path | <feature>/<NN> | NN]"
---

# MtgTrader commit

Typing `/mtg-commit` is the user's go-ahead, which `CLAUDE.md` requires, to commit **one ticket**. Each run makes exactly two local commits:

1. the **code commit**: the ticket's code, tests and migration, under a Conventional Commit message in English;
2. the **close commit**: the ticket file alone, marked `done` with the code commit's hash.

The run ends with those two commits on the current branch; pushing stays with the user.

Ticket: $ARGUMENTS

## 1. Find the ticket

Tickets live at `.scratch/<feature>/issues/<NN>-<slug>.md` (see `docs/agents/issue-tracker.md`). Resolve the argument to one file; `NN` alone must match a single feature. With no argument, take the ticket whose file is uncommitted and whose `Status:` isn't `done`. If several or none match, ask which one.

Read the whole ticket. It is ready to commit when every acceptance checkbox is `[x]` and its status is neither `done` nor `wontfix`. Otherwise stop and say what's missing.

## 2. Sort the uncommitted files

List them with `git status --porcelain -uall`, read each diff, and put every file in exactly one group:

- **in**: written for this ticket. The ticket's `## Comments` usually names the classes, components and tests; the diff confirms it. A new migration generated for the ticket goes in with its `.Designer.cs` and the updated `ApplicationContextModelSnapshot.cs`.
- **out**: everything else: another ticket's work, setup files under `.claude/` or `docs/`, and the ticket file itself, which belongs to the close commit.

Stop and ask the user when a file mixes this ticket's changes with other work, since splitting hunks needs interactive staging. Stop too when an **in** file is on the "Leave alone" list in `CLAUDE.md` (an existing migration, `database/database.sql`, an `ssl/` folder, a hand-edited `package-lock.json`) or holds a secret.

The step is done when every uncommitted file sits in one group, with a reason for each **out** file.

## 3. Validate

Run the mechanical checks from step 4 of `.claude/skills/mtg-review/SKILL.md` for each side that has **in** files, linting only the **in** files. The quality gate checks only what changed during the current turn, and the ticket's code was written in earlier turns, possibly edited by hand since, so this run is what vouches for the commit.

The checks run on the working tree, so **out** files on the same side are part of what they validate; say so in the summary when that happens. A red check ends the run: report its error lines and commit nothing.

## 4. Write the message

[Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/), in English:

```
<type>(<scope>): <subject>

<body>

Refs: .scratch/<feature>/issues/<NN>-<slug>.md
```

- **type**: `feat` for new behaviour, `fix` for a bug, `refactor` when behaviour stays the same; `test`, `perf`, `build` or `chore` for the rest. Read it off the ticket and the diff.
- **scope**: the app area at the centre of the change, in kebab-case, named after its folder under `server/MtgTrader.Core/Handlers/` or `client/src/app/features/` (`trade`, `trade-proposals`, `wantlist`, `chat`, `auth`).
- **subject**: imperative, lower case, no final period, first line under 72 characters. It names what a user or caller gains.
- **body**: wrapped at 72 columns. Two to five lines on what changed on each side (server, client) and why, plus what a reviewer must know: a migration and what it does to existing data, a changed API shape.
- A change to a request/response shape or a hub method that the previous client can't handle takes `!` after the scope and a `BREAKING CHANGE:` footer.

## 5. Confirm

Show the user, in one message: the branch, the full message, the **in** files, the **out** files with their reasons, and the check results. Commit after their explicit yes, applying first any change they ask for to the message or the file list.

## 6. Code commit

1. Stage the **in** files by path: `git add -- <path> ...`. Check that `git diff --cached --name-only` lists exactly the **in** files; unstage any **out** file that was already staged with `git restore --staged -- <path>`.
2. Write the message to a temporary file outside the repo and commit with `git commit -F <file>`, letting the git hooks run.
3. Read the short hash: `git rev-parse --short HEAD`.

## 7. Close commit

1. In the ticket, change the value of its `Status:` line to `done`, keeping the line's formatting, and append under `## Comments` (add the heading at the end of the file if missing):

   `- <YYYY-MM-DD> : done in <short hash> (<subject line of the code commit>).`

2. Stage the ticket file alone and commit it with the message `chore(scratch): close ticket <feature>/<NN>`.

## 8. Report

- both commits, each with its short hash and subject;
- the **out** files, still uncommitted;
- the checks that ran.

End with the next command, `git push`, for when the user wants the commits on the remote.
