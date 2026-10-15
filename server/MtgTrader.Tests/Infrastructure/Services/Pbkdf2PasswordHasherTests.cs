namespace MtgTrader.Tests.Infrastructure.Services;

public class Pbkdf2PasswordHasherTests
{
    private readonly Pbkdf2PasswordHasher _hasher = new();

    [Fact]
    public void Should_not_contain_password_when_hash()
    {
        var hash = _hasher.Hash("secret");

        hash.Should().NotContain("secret");
        _hasher.IsHashed(hash).Should().BeTrue();
    }

    [Fact]
    public void Should_return_different_hashes_when_hash_same_password_twice()
    {
        _hasher.Hash("secret").Should().NotBe(_hasher.Hash("secret"));
    }

    [Fact]
    public void Should_return_true_when_verify_right_password()
    {
        var hash = _hasher.Hash("secret");

        _hasher.Verify("secret", hash).Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_verify_wrong_password()
    {
        var hash = _hasher.Hash("secret");

        _hasher.Verify("Secret", hash).Should().BeFalse();
    }

    [Fact]
    public void Should_verify_plain_text_password_when_stored_before_hashing()
    {
        _hasher.IsHashed("secret").Should().BeFalse();
        _hasher.Verify("secret", "secret").Should().BeTrue();
        _hasher.Verify("other", "secret").Should().BeFalse();
    }
}
