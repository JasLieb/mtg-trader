# MtgTrader

MtgTrader is a comprehensive solution for managing Magic: The Gathering card wishlists and tradeable doubles, connecting players, and facilitating trades and card exchanges. This project consists of both client and server components, providing a full-stack application for Magic: The Gathering enthusiasts.

## Folders

- `client`: Contains the frontend code for the application, built with Angular. It includes all the necessary configurations, components, services, and styles to provide a responsive and interactive user interface.

- `server`: Contains the Web API solution, written in C#/.NET, which includes core business logic, infrastructure, and tests. It is responsible for handling requests, processing data, and interacting with the database.

- `database`: Contains database initialization scripts, written in SQL, which are used by the PosgreSQL container through a volume.

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
