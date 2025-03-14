using MtgTrader.Core.Services;

namespace MtgTrader.Infrastructure.Services;

public class DateTimeService : IDateTimeService
{
    public DateTime Now => DateTime.Now.ToUniversalTime();
}
