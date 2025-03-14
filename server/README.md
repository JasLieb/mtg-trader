# MtgTrader

MtgTrader is a .NET solution for managing and trading Magic: The Gathering cards. This solution consists of multiple projects including a Web API, core services, infrastructure, and unit tests.

## Projects

- **MtgTrader.Core**: Contains the core business logic, entities, handlers, repositories, and services.
- **MtgTrader.Infrastructure**: Contains the infrastructure-related code such as database contexts, configurations, and migrations.
- **MtgTrader.WebApi**: The Web API project that exposes the endpoints for the application.
- **MtgTrader.Tests**: Contains unit tests for the core and infrastructure projects.

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Dotnet EntityFramework](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (for local development)
- [PostgreSQL](https://www.postgresql.org/) (for local development)
- [Docker](https://www.docker.com/get-started) (optional, for containerization)

## Getting Started

### Setup the Database

Excepted have a PostgreSQL installed on your computer in the case of local development, you have nothing to do about creating the database relational model. Everything is done through migrations during the server startup.

The solution use EntityFramework migration in order to update and mantains the database, run the following command in the `server` directory when you have modified the database model and you make a new migration:

`dotnet ef migrations update <MigrationName> --project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi`

### Building the Solution

To build the solution, run the following command in the `server` directory:

`dotnet build`

### Running the Web API

To run the Web API, navigate to the `MtgTrader.WebApi` directory and use the following command:

`dotnet run`

The Web API will be available at https://localhost:7175.

### Running Tests

To run the unit tests, navigate to the `MtgTrader.Tests` directory and use the following command:

`dotnet test`

### Docker Support

To build and run the solution using Docker, use the following commands, from the `server` directory:

`docker build -t mtgtrader .`

`docker run -p 7175:7175 mtgtrader`

### Configuration

Configuration files are located in the `MtgTrader.WebApi` directory:

- appsettings.json: Default configuration settings.
- appsettings.Development.json: Development-specific configuration settings.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### License

This project is licensed under the MIT License.