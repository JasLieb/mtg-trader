# Templates

Leave out any section that would be empty, and keep each one to what a reader needs. `<…>` marks text to replace. `<!-- … -->` lines are guidance for the author: keep them only where the author still has to act (screenshots, manual checks).

## Contents

- Deployment section (shared by the PR and the release file)
- PR description: `docs/pull-requests/<branch>.md`
- Release file: `docs/releases/<date>.md`
- CHANGELOG entry

## Deployment section

When nothing deploy-relevant changed, the whole section is one line:

```markdown
## Deployment

No deployment steps: <why, e.g. "only Claude tooling and docs changed">. Merging still redeploys both Render services, with no functional change.
```

Otherwise:

```markdown
## Deployment

**Risk:** <low | medium | high>: <the main reason>< "; N more below" when several apply>

**Before merging**
- [ ] <action, where to do it, and why. e.g. "Confirm `JWT_SECRET` is set on the Render `api` service (Environment). The API now refuses to start without it.">
- [ ] <check, with the exact query or command>

**During the deploy**
- <what happens on its own: migration X runs at API start and <effect on existing rows>; users are logged out; the window in which an old client meets the new API>

**After the deploy**
- [ ] `GET https://api-p4y7.onrender.com/api` returns the welcome message
- [ ] <smoke test for each touched feature, from references/deployment.md section 4>

**Rollback**
- <revert on main; whether the previous code works on the new schema; what can't be undone>
```

"Before" items are things a person must do or check. "During" items happen on their own. Write each so that someone who didn't write the code can act on it.

## PR description

The file holds the title as its first heading, so the user can copy both.

```markdown
# <type(scope): summary, e.g. "feat(client.wantlist): pick a card's printing">

## Summary
<2–4 sentences: what changes for players or developers, and why. The motivation comes from the commits, the branch or the user, never invented.>

## Changes
**Server**
- <behaviour, in words> (`WantlistHandler`, `WantlistController`)

**Client**
- <behaviour> (`WantlistService`, `update-set` dialog)

**Tooling, CI and docs**
- <one line per theme>

## API contract
| Endpoint / hub member | Change | Client side |
|---|---|---|
| `PUT api/wantlist` | `UpdateWantlistRequest` gains `setId` | ✅ `WantlistService.updateWantlist` |
| `ReceiveMessage` | payload is now a `ChatMessageResponse` object | ⚠️ `chathub.proxy.ts` unchanged |

<!-- Only rows that change something a caller can observe. A renamed file with the same shape doesn't need a row. -->

Then one line on whether the old client works against the new API and the reverse: the deploy-order window.

## Database
- Migration `<timestamp>_<Name>`: <what it does>. Existing rows: <what they get>.

<Deployment section>

## Testing
- Tests added or changed: <names, grouped by side, with what they cover when it isn't obvious>
- Checks run: <only checks actually run in this session, e.g. "client render build ✅", "server tests ✅ 61 passed (run by mtg-review)"> | none run while writing this
- [ ] CI green on GitHub (CI Back Validation, CI Client Validation)
- [ ] Manually tested: <the flows from the smoke-test table>

## Screenshots
<!-- Only when the diff changes what a player sees: add before/after screenshots of <the screens that look different> -->

## Reviewer notes
- **Needs sign-off:** <Ask-first items: new package, JWT/CORS/interceptor, deployment files>
- **Look closely at:** <the riskiest code, and why>
- **Blockers spotted while writing this** (not a review, run `mtg-review`): <one-sided contract, edited migration, …>
- **Not in this PR:** <follow-ups deliberately left out, if the commits or the user mention any>
```

Order "Changes" by what matters to a reviewer, not by commit order. A branch that bundles unrelated work (common here) gets one bullet group per theme, and the Summary says it's a bundle.

## Release file

```markdown
---
date: <YYYY-MM-DD>
from: <full sha, as printed by changes.js>
to: <full sha>
---

# Release <YYYY-MM-DD>

<2–3 sentences: the headline changes for players, then the deploy risk in a few words.>

**Range:** [`<from7>...<to7>`](<compare URL>) · <n> commits · <server | client | server + client>
**Deploy risk:** <low | medium | high>: <reason>
**Pull requests:** <#12, #13, or the docs/pull-requests files in range; leave out if none>

## What's new
### Added
- **<Area>:** <what players can now do>. ([`abc1234`](<repo>/commit/abc1234))
### Changed
- …
### Fixed
- **<Area>:** <what no longer goes wrong, described by its symptom>. ([`def5678`](…))

## Internal
- <refactors, tests, CI, tooling, dependencies: one line per theme, no links needed>

<Deployment section>

<details><summary>All commits (<n>)</summary>

- `abc1234` <original subject>
- …
</details>
```

Group commits that belong to one change into one bullet with several links. Leave out commits marked "release docs only".

## CHANGELOG entry

Create `CHANGELOG.md` with this header if it doesn't exist:

```markdown
# Changelog

User-facing changes to MtgTrader, newest first. Each entry is one deploy of `main` to Render. The full notes, including deployment steps, are in [`docs/releases/`](docs/releases/).
```

Each entry goes directly under the header, above the previous ones:

```markdown
## <YYYY-MM-DD>

### Added
- **Wantlists:** choose which printing of a card you want, with its price and availability.
### Fixed
- **Chat:** history now shows in date order.

[Release notes](docs/releases/<file>.md)
```

Only what a player would notice goes in the CHANGELOG: features, visible fixes, behaviour changes such as "you'll need to log in again". Internal work stays in the release file. If a release has nothing user-facing, the entry is a single line: "Maintenance only: no user-facing change."
