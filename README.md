# MtgTrader

MtgTrader is a comprehensive solution for managing Magic: The Gathering card wishlists, tradeable doubles, for connecting players between and allows trades, card exchanges.
This project consists of both client and server components.

## Folders

- **client**: Contains the frontend code for the application, built with Angulat.

- **server**: Contains the Web API solution, written in C#/.NET with core business logic, infrastructure and tests

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Dotnet EntityFramework](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (for local development)
- [PostgreSQL](https://www.postgresql.org/) (for local development)
- [Node.js](https://nodejs.org/) (for the client)
- [Angular](https://angular.dev/) (for the client)
- [Docker](https://www.docker.com/get-started) (optional, for containerization)
- [Docker Compose](https://docs.docker.com/compose/) (optional, for containerization)

## Getting Started

### Building app

In order to build client app or server web API on your machine, you can follow instructions given by nested README files available in both `client` and `server` folders.

At the project top level, you can start the whole app using Docker-Compose

### Docker Support


To build and run the solution using Docker Compose, use the following commands:

`docker-compose build`

`docker-compose up`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
