# CS310 Project

Submission Aggregation Web Platform

## Setup

1. Download and install [Bun](https://bun.sh/).
   > Alternatively use the Nix flake using [direnv](https://direnv.net/) with `direnv allow`.
2. Copy the example environment file and rename it:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your specific settings.

- **DATABASE_URL**: URL for database, Leave as is for SQLite.
- **AUTH_SECRET**: Crypto Secure random string of atleast 32 chars
  - Generate using `bunx auth secret`
- **AUTH_KEYCLOAK_ID**: Keycloak client ID
- **AUTH_KEYCLOAK_SECRET**: Keycloak client secret
- **AUTH_KEYCLOAK_ISSUER**: Keycloak issuer URL

4. Install the dependencies with:

```bash
bun install
```

## Running the Development Server

First, make sure the database is setup with:

```bash
bun prisma migrate dev
```

To start the application in development mode:

```bash
bun run dev
```

This will normally start the server on `http://localhost:5173`. Check the terminal output for the actual address.

## Building for Production

To create a production build use:

```bash
bun run build
```

### _Alternative_: Running with Docker

First, edit the `docker-compose.yml` file to setup the environment

Build and run the containers with:

```bash
docker-compose up --build
```
