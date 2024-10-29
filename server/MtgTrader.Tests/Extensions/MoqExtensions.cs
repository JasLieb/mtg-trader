namespace MtgTrader.Tests.Extensions;

public static class MoqExtensions
{
    public static Mock<DbSet<T>> AsDbSetMock<T>(this IEnumerable<T> list) where T : class
    {
        var queryableList = list.AsQueryable();
        var dbSetMock = new Mock<DbSet<T>>();
        dbSetMock.As<IQueryable<T>>().Setup(x => x.Provider).Returns(queryableList.Provider);
        dbSetMock.As<IQueryable<T>>().Setup(x => x.Expression).Returns(queryableList.Expression);
        dbSetMock.As<IQueryable<T>>().Setup(x => x.ElementType).Returns(queryableList.ElementType);
        dbSetMock.As<IQueryable<T>>().Setup(x => x.GetEnumerator()).Returns(() => queryableList.GetEnumerator());
        return dbSetMock;
    }
}
