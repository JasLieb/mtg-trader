---
name: mtg-release-docs
description: Write the documentation that goes with shipping MtgTrader changes, across the .NET API and the Angular client. That means a pull request description; release notes with a CHANGELOG entry; and deployment notes covering migrations and what they do to existing data, environment variables to set on Render, JWT, CORS and API-host changes, the window in which client and API versions differ, smoke tests and rollback. Use it whenever the user wants to open, write up or describe a PR or a branch, summarize what changed since the last deploy, prepare a release or a deploy, update the changelog, or know what to do before or after deploying ("write the PR description", "prepare the release notes", "what's going out in the next deploy?", "do I need to set anything on Render for this?", "rédige la description de la PR", "notes de déploiement"), even if they don't say "documentation". Prints the result ready to paste into GitHub and saves it under docs/.
---

# MtgTrader release docs

Merging to `main` is a deployment here. Both Render services have `autoDeploy: true`, and the API applies pending migrations when it starts. So the PR description is the last thing a person reads before a change reaches production, and the release notes are the only record of what went out when, since the repo has no tags and no other changelog. These docs earn their place when they tell a reviewer what changed and why, tell players what's new, and tell whoever deploys exactly what to do and check. A wrong doc is worse than none. Don't write anything that the diff, the commits, a check you ran or the user doesn't back up.

## Pick the document

| The user wants | Mode | You write |
|---|---|---|
| A PR description, a write-up of a branch, "ready to open a PR" | `pr` | `docs/pull-requests/<branch>.md` |
| Release notes, the changelog, "what's going out", "prepare the deploy" | `release` | `docs/releases/<date>.md`, plus a new entry at the top of `CHANGELOG.md` |
| Only deployment notes ("anything to do on Render for this?") | `pr` on a feature branch, `release` on `main` | Only the Deployment section, in that mode's file |

When the request is vague ("document this"), use `pr` on a feature branch and `release` on `main`.

## 1. Collect the facts

```
node .claude/skills/mtg-release-docs/scripts/changes.js pr [--base <ref>]
node .claude/skills/mtg-release-docs/scripts/changes.js release [--from <ref>] [--to <ref>]
```

The script only reads git. It prints the range, the commits with their type normalized (this repo writes `refacto`, `chores` and `feat(db) feat(docs) :`), the changed files grouped by side and tagged, the **deploy signals** with diff excerpts, the features and screens touched, the doc path to write, the compare URL, and the push status.

- **`pr`** compares the branch with its merge-base with `main`, uncommitted and untracked files included, because the user usually commits them before opening the PR. The script lists them separately. Mention them in your reply, not in the doc.
- **`release`** starts from the `to:` commit in the newest `docs/releases/*.md` and runs to `main`. If that newest file isn't committed yet, the script assumes you're regenerating it and reuses its own range. When no release has been recorded yet (the first run), the script stops and lists recent commits. Ask the user where to start: the commit live on Render now (the `api` service's Events page shows it), or the earliest change they want covered. Don't guess. The range decides everything in the doc.
- If the script reports that local `main` is behind `origin/main`, ask whether to pull before going on.
- If nothing changed in the range, say so and stop.

## 2. Understand the change

Treat commit subjects as an index, not as the content. They're terse here, and one branch often bundles unrelated work. Read the diff behind anything you describe (`git diff <range> -- <path>`), group commits that make one change together, and describe behaviour rather than files.

- **Why.** Take it from commit bodies, the branch name, the conversation, or code comments. A subject that names where the change came from ("fix: review on server app") counts as a reason: say what that review found and what this fixes, and add nothing more. If nothing explains a change, ask the user one short question rather than inventing a motivation.
- **Contracts.** For each changed server record, controller or hub member, open the client counterpart and say whether it matches. `.claude/skills/mtg-schema-change/references/layers.md` pairs each record with its interface.
- **Don't review.** If you run into a real problem (a one-sided contract, an edited migration, a "Leave alone" file), list it under Reviewer notes and suggest `mtg-review`. Don't fix it as part of writing docs.

## 3. Work out the deployment impact

Read `references/deployment.md`. It explains how the app is deployed and, for each signal the script can raise, what to check and what to write. Every signal ends up as a step or a note in the Deployment section, or is explicitly dismissed (e.g. "dev only"). An unaddressed signal is how a deploy goes wrong without anyone noticing. Give the most attention to **stored data that the new code reads differently** (hashing, normalization, id formats). It's the subtlest risk and the easiest to miss: no migration shows it, and the script's section on it is only a heuristic that points you at candidate lines.

Run these checks, because nothing else runs them before Render does:

- **A new migration or a model change:** get the SQL with the command the script prints and judge its effect on existing rows. Then run `node .claude/skills/mtg-schema-change/scripts/ef.js migrations has-pending-model-changes`; it must report no changes, or the deploy won't create the schema the code expects. If the working tree isn't at the range's end, read `Up` and `Down` with `git show` instead and say the check couldn't run.
- **Client code changed:** from `client/`, run `npx ng build --configuration=render`. CI only runs the client's tests, while Render runs this build, and its budgets have failed a deploy before (`6a9cd73`). A failure is a blocker in the Deployment section. If `node_modules` is missing, write "not run" instead of skipping it silently. The build writes `client/dist/`, which is gitignored.

Don't run the full test suites just to write a doc. Report only checks that actually ran in this session, whether you ran them or an earlier `mtg-review` did, and leave the rest as unchecked boxes. CI results can't be read from here (no `gh` CLI), so never claim CI is green.

## 4. Write

Use `references/templates.md`, and English throughout.

- **Write for the reader.** A PR description is for a reviewer who knows the codebase. The CHANGELOG is for players: what they can now do or what stopped going wrong, in their words (wantlists, doubles, trades, chat, card printings), with no file names and no refactors. A release file is for whoever deploys and supports the app.
- **Describe behaviour, then point at files.** "Players can choose which printing of a card they want, with its price" beats "add update-set dialog component". File and class names go in parentheses, as pointers for the reviewer.
- **Keep it short.** Leave out empty sections. A tooling-only PR fits in a few lines. Padding hides the one line the reader needs. On a large branch, cut in this order: detail in Changes (one line per behaviour), contract-table rows that change nothing observable, then per-test detail in Testing. Never cut from Deployment. A reviewer should get the point from the Summary and the Deployment risk line alone.
- **Screenshots only for visible changes.** The script's "UI touched" lists files, not visible changes. Ask for screenshots only when the diff changes what a player sees (layout, styles, text, a new dialog), not for lint fixes or renamed outputs.
- **Title.** Use `type(scope): summary` (the colon form the recent history uses), with scopes such as `client.wantlist`, `server.chat`, `deploy` or `ci`. For work spanning several areas, use the widest scope that fits, or none.
- **Say what you didn't verify.** Mark anything you inferred but didn't check with "(not verified)". Never write a secret value, even one that's visible in the diff.

## 5. Save and hand over

- Write the file at the path the script printed. If it already exists, read it first and keep what a person added (screenshots, notes, reworded text) unless the new diff contradicts it. Regenerate the rest.
- In `release` mode, also update `CHANGELOG.md`. Create it with the template's header if it's missing, and add the entry at the top. When regenerating a release, replace its existing entry instead of adding a second one.
- Write nothing outside `docs/` and `CHANGELOG.md`. Don't commit or push: both are "Ask first" in `CLAUDE.md`.
- The PR doc is meant to be committed on the branch it describes. That way it travels with the PR, and a later `release` run lists it among the PR docs in its range and can reuse its deploy steps. The script leaves it out of the change it analyses. Say this to the user; whether to commit is their call.

Then reply:

- **`pr`**: the description, title included, inside a four-backtick fence (```` ````markdown ````). A doc often contains its own ```` ```sql ```` or ```` ```diff ```` blocks, and a three-backtick outer fence would end at the first of them. This way the description pastes into GitHub without being rendered first. Then the file path and the compare URL (`?expand=1` opens the PR form). Say if the branch isn't pushed yet, and list any uncommitted files the PR won't contain until they're committed.
- **`release`**: the CHANGELOG entry and the Deployment section in a four-backtick fence, then the path of the release file for the rest.
- End with what the user must decide or do: blockers, unanswered questions, and anything marked "(not verified)".
