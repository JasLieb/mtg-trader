---
paths:
  - "server/MtgTrader.Infrastructure/**/*.cs"
  - "server/MtgTrader.Core/Entities/General/**/*.cs"
  - "server/MtgTrader.Tests/Infrastructure/**/*.cs"
  - "database/**"
---

# Data access

Repositories derive from `BaseRepository<T>` and query through its `DbSet` property, which is `dbContext.Set<T>()`. The repository tests fake exactly that call (`MoqExtensions.AsDbSetMock`), so a query through `ApplicationContext`'s typed properties (`Users`, `Wantlists` and so on) would bypass the fake and could not be tested.

Every `BaseRepository` write calls `SaveChanges()` immediately. A handler that makes several writes (deleting a wantlist and then its cards, for instance) is therefore not atomic, so decide deliberately when an operation needs to be.

EF Core migrations own the schema. A change to an entity in `Core/Entities/General` or to `ApplicationContext.OnModelCreating` needs a migration generated with `dotnet ef migrations add`; the API applies pending migrations when it starts. `database/database.sql` is a frozen copy of `InitialMigration`: it seeds the Docker Postgres container and records that migration as applied, and the API applies every later migration on top. New schema therefore goes into a migration, not into that script.
