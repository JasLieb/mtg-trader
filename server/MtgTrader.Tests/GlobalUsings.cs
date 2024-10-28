global using Xunit;
global using Moq;
global using NSubstitute;
global using FluentAssertions;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.ChangeTracking;
global using Microsoft.Extensions.Configuration;

global using MtgTrader.Infrastructure.Contexts;
global using MtgTrader.Infrastructure.Repositories;
global using MtgTrader.Infrastructure.Services.JwtToken;

global using MtgTrader.Core.Entities.Business;
global using MtgTrader.Core.Entities.General;
global using MtgTrader.Core.Handlers.Auth;
global using MtgTrader.Core.Repositories;
