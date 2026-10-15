---
paths:
  - "server/MtgTrader.Tests/**/*.cs"
---

# Server tests

The tests mirror the code they cover (`Core/<Feature>/` for handlers, `Infrastructure/Repositories/` and `Infrastructure/Services/` for the rest). Each case is named `Should_<outcome>_when_<condition>`, and assertions use FluentAssertions.

Two mocking libraries are in use, chosen by what is being faked. NSubstitute (`Substitute.For<T>()`) fakes Core interfaces and `IConfiguration` in handler and service tests. Moq is used only where an EF `ApplicationContext` or `DbSet` has to be faked, because `AsDbSetMock` is built on it. Shared namespaces are global usings in `GlobalUsings.cs`.
