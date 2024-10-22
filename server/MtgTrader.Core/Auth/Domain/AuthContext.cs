using System;
using Microsoft.EntityFrameworkCore;

namespace MtgTrader.Core.Auth.Domain;

public class AuthContext(DbContextOptions<AuthContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
}
