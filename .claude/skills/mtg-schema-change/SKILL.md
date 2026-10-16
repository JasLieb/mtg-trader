---
name: mtg-schema-change
description: Carry a data-model change through the whole MtgTrader stack in one go. That covers the EF Core entity and `ApplicationContext` configuration; a generated migration, checked for data loss and applied to the local database when one is running; the API's request/response records; and the matching TypeScript models, services and specs in the Angular client. Use it whenever the user wants to add, remove, rename or retype a field, column, entity, table, index, relationship or constraint, or when a review, a build or `dotnet ef` reports a missing migration or pending model changes. Also use it for "add a migration", "update/apply the database", "the review says I need a migration", "ajoute un champ", even if they only mention one side (server or client) or only the migration.
---

# MtgTrader schema change

In this repo one model change lands in three places that nothing keeps in sync. The first is the EF Core model and its migrations. The second is the API's records. The third is the client's hand-written TypeScript interfaces. When one of them is forgotten, a review flags a missing migration later, or the client silently reads `undefined`. This skill moves the change through all three, checks the migration before it reaches a database, and reports what happened to existing data.

## Tooling

Run `dotnet ef` through the bundled helper, from the repo root:

```
node .claude/skills/mtg-schema-change/scripts/ef.js <dotnet ef arguments>
node .claude/skills/mtg-schema-change/scripts/ef.js db-target
```

It runs in `server/` and adds `--project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi`. It also sets `DOTNET_ROLL_FORWARD` and `DOTNET_ROOT`: the server targets net8.0, and some machines (this one included) only have a newer runtime in a non-default folder, where a bare `dotnet ef` fails with "You must install .NET". `db-target` prints the database the API would use, with the same environment-over-appsettings precedence as the API, and whether it is local and reachable.

The ones you'll use:

| Purpose | Arguments |
|---|---|
| Is the model in sync with the migrations? (exit 0 = yes) | `migrations has-pending-model-changes` |
| Generate | `migrations add <Name>` |
| SQL a migration will run (no DB needed) | `migrations script <PreviousMigration> <NewMigration>` |
| Apply to the configured DB | `database update` |
| Delete the newest migration (see "Redo") | `migrations remove` |

Every EF command prints three warnings that a navigation "was first mapped explicitly and then ignored". They predate this skill; ignore them.

## 1. Start from a clean, understood state

Read `.claude/rules/data-access.md` and `.claude/rules/api-contracts.md`. They're short and they're the source of truth. Also read `rules/wantlists.md` if wantlists are involved and `rules/chat.md` if chat messages are.

Run `migrations has-pending-model-changes` before editing anything. If it already reports changes, the model was edited without a migration. That is usually why the user is here ("the review says this needs a migration"). In that case, find the edit (`git diff` on `Core/Entities/General/` and `ApplicationContext.cs`), make sure you understand it, and continue from step 3. Don't stack a second change on top.

## 2. Pin down the change, then make it on the server

Settle these questions before generating anything. A migration is cheap to regenerate before it's committed and expensive after it's deployed, because the API applies it automatically on start.

- **What changes in the schema?** A column, an entity, an index, a relationship or a constraint, and whether it's an addition, a rename, a type change or a removal.
- **What do existing rows get?** Deployed databases already hold users, wantlists, cards and messages. A new non-nullable column needs a value that means something for them. Without one they get `''`, `0` or `0001-01-01`. That's what `AddMessageDate` did to every existing `ChatMessages.Date`.
- **Who sees it?** It might be server-only (a hash, an internal flag), returned by the API (in which records?), or sent by the client (in which request?). Entities never go over the wire. Records in `Core/Entities/Business` do, so expose a field only where it's needed.
- **Domain rules.** Card data (names, prices, images, sets) never goes into a table; Scryfall owns it and the client fetches it through `CardService`. If the request is to store card information, say so and propose the client-side route instead. If wantlists change, decide what the `{userId}_doubles` list gets. It's created in `AuthHandler.CreateUser`.

If one of these has no clear answer from the request, ask the user one short question rather than guessing. That applies especially to the value for existing rows, and to whether the client should display the field.

Then edit the server model. `references/layers.md` lists where each piece lives:

- **Configure in `ApplicationContext.OnModelCreating`, not with attributes.** `MtgTrader.Core` has no EF dependency, so keys, indexes, max lengths, defaults, relationships and column names use the fluent API there.
- **Nullability is schema.** `string` becomes a NOT NULL column and `string?` a nullable one.
- **Constructor binding.** Entities use primary constructors, and EF binds their parameters to properties by name. A new constructor parameter must match its property's name in camelCase, and every `new Entity(...)` call site, in handlers and in tests, has to pass it. An optional or defaulted field can instead be a plain property with an initializer, which leaves the call sites alone. Navigation properties can't be bound through the constructor.
- **Write the data plan into the model so the generator produces it.** For a new non-nullable column, use `HasDefaultValue(...)` or `HasDefaultValueSql("now()")`. To rename a property without touching the column, use `HasColumnName("OldName")`.
- **A new entity needs the full set.** That means a `DbSet` on `ApplicationContext`, a repository interface in `Core/Repositories/`, and an implementation deriving `BaseRepository<T>` that queries through `DbSet` (the tests can only fake that). Register the repository as transient in `ServicesExtensions.RegisterServices`, and add tests that use `AsDbSetMock`.

Build: `dotnet build MtgTrader.sln -v q` from `server/`.

## 3. Generate the migration

Pick a PascalCase name that says what changed, like `AddWantlistCreatedAt`, `UniqueUsername` or `RenameWantlistNameToTitle`, and check that no migration already has it. Then run `migrations add <Name>`.

Three files should change: the new `<timestamp>_<Name>.cs`, its `.Designer.cs`, and `ApplicationContextModelSnapshot.cs`. Run `migrations has-pending-model-changes` again. It must report no changes.

Don't write or edit migration files by hand, including the one you just generated. `protect-files.js` blocks Edit and Write under `Migrations/`, and the snapshot only stays consistent with what EF generated. If the migration is wrong, fix the model and regenerate it (see "Redo").

## 4. Review the migration before anything runs it

`AppExtensions.EnsureDatabaseExists` applies pending migrations when the API starts, in Docker and on Render as well as locally. Nobody looks at the migration at deploy time, so this step is its review. Read `Up` and `Down`, and get the exact SQL with `migrations script <PreviousMigration> <NewMigration>`. Then look for these:

| In the migration | What happens on a database with data | Fix in the model, then regenerate |
|---|---|---|
| `AddColumn` that is non-nullable, with a placeholder `defaultValue` (`""`, `0`, `0001-01-01`) | Every existing row gets the placeholder | `HasDefaultValue`/`HasDefaultValueSql` with a meaningful value, or make the column nullable. Agree on it with the user |
| `DropColumn` + `AddColumn` on one table where you meant a rename | The column's data is lost | `HasColumnName("Old")` keeps the existing column. If the column itself must be renamed and EF didn't generate `RenameColumn`, stop and ask. The fix is a hand edit of the generated file, which the hook blocks, so the user has to make or authorize it |
| `DropColumn`, `DropTable` | Data loss | Confirm the user intends it, and say so in the report |
| `AlterColumn` that narrows (shorter max length, nullable to non-nullable, a type change) | Fails, or truncates existing values | Say so. Offer a default or a two-step change |
| Unique `CreateIndex` on an existing table | Fails if duplicates exist, and then the API fails to start | Flag it. Give the user a query to find duplicates before deploying |
| Operations unrelated to the change | The model had drifted from the migrations earlier | Find where the drift came from before keeping it |

`Down` should undo `Up`. If something in the table applies and the fix needs a decision from the user, stop here and ask them before going further.

## 5. Apply it, if a local database is running

Run `node .claude/skills/mtg-schema-change/scripts/ef.js db-target`.

- **`local=yes reachable=yes`:** run `database update`, then `migrations list` to confirm the new migration shows as applied. If the API is running, it keeps its old model until restarted, so say so.
- **`local=no`:** the target may be shared or production. Ask before applying.
- **`reachable=no`:** don't start a database yourself. Tell the user the API applies the migration on its next start, and that they can also run `database update` through the helper once Postgres is up.

`database/database.sql` stays as it is in every case. It's a frozen copy of `InitialMigration` that seeds the Docker Postgres, and the API applies every later migration on top of it.

## 6. Carry the change through the API and the client

Skip this step if the change is server-only, such as an index, a constraint or an internal column. Say in the report that the client needs nothing, and why.

Otherwise follow the field outward, using `references/layers.md` for paths and the record-to-interface map:

1. **Handler:** the code that maps the entity to a response record, or a request record to the entity.
2. **Record:** in `Core/Entities/Business/`. A new positional parameter breaks every `new Record(...)`, so the build will list the call sites, tests included.
3. **Controller or hub,** if the request or the response shape changed. Wantlist mutations keep returning the caller's full `WantlistsResponse`.
4. **Client interface:** the matching one in a feature's `models/`. The names differ from the server's (`WantlistResponse` is `WantlistMin`, for example), and fields are camelCase. A C# `string?` arrives as `null`, so type it `string | null`. A `DateTime` arrives as an ISO string.
5. **Client mapping:** several services turn the wire type into a richer one: `WantlistService.makeUserWantlists` turns `WantlistMin` into `Wantlist`, and `TradeService.populateUser` turns `UserTraderMin` into `UserTrader`. Carry the field through that mapping too, or it disappears there.
6. **Specs and tests** that build these objects. Grep for the interface and record names.
7. **Display,** only if the user asked for it.

## 7. Verify

- Server, from `server/`: `dotnet build MtgTrader.sln -v q`, then `dotnet test MtgTrader.sln --no-build` with `DOTNET_ROLL_FORWARD=Major` set in the same command, then `migrations has-pending-model-changes` through the helper.
- Client, from `client/`, if it changed: `npx eslint <changed files>`, `npx ng build --configuration development`, and `npm test -- --watch=false --browsers=ChromeHeadless`. If `node_modules` is missing, report that instead of skipping silently.

The quality-gate hook builds and tests again when the turn ends. Running the checks here lets you fix failures while you still have the context.

## 8. Report

```markdown
## Schema change: <one-line summary>

**Migration:** `<timestamp>_<Name>`: <what Up does, in one line>
**Existing data:** <what existing rows get, or the risk the user has to know about before deploying>
**Applied:** <local DB updated | not applied: <reason>; the API applies it on its next start>
**Server:** <files changed, grouped by layer>
**Client:** <files changed | no change needed: <why>>
**Checks:** server build ✅ · tests ✅ N passed · model in sync ✅ · client build ✅ · …

<details><summary>SQL</summary>

<the Up SQL from `migrations script`>
</details>
```

Don't commit. Committing is "Ask first" in CLAUDE.md.

## Redo or undo

- **The migration is only on this branch** (`git log main --oneline -- <migration file>` prints nothing): ask the user, then remove it. If you applied it locally, first run `database update <PreviousMigration>`. Then run `migrations remove`, fix the model and generate again. `migrations remove` is the one sanctioned way to delete migration files, and only for one this branch created.
- **The migration is on `main` or has been deployed:** never remove it. Add a new migration that corrects it.
