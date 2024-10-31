global using Xunit;
global using Moq;
global using NSubstitute;
global using FluentAssertions;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Configuration;

global using MtgTrader.Tests.Extensions;

global using MtgTrader.Infrastructure.Contexts;
global using MtgTrader.Infrastructure.Repositories;
global using MtgTrader.Infrastructure.Services.JwtToken;

global using BReqREntities = MtgTrader.Core.Entities.Business.Requests;
global using BResEntities = MtgTrader.Core.Entities.Business.Responses;
global using GEntities = MtgTrader.Core.Entities.General;
global using MtgTrader.Core.Handlers.Auth;
global using MtgTrader.Core.Handlers.Wantlist;
global using MtgTrader.Core.Repositories;
