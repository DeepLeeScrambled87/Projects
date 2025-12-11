# API OS

A modern API development platform built with Next.js 14, TypeScript, and a monorepo structure.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Monorepo** structure with npm workspaces
- **Tailwind CSS** for styling
- **ESLint & Prettier** for code quality
- **Docker** support with PostgreSQL
- **DevContainer** configuration for VS Code
- **GitHub Actions** CI/CD pipeline

## Project Structure

```
api-os/
├── apps/
│   └── web/                 # Next.js web application
│       ├── src/
│       │   ├── app/         # Next.js App Router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utility libraries
│       │   └── types/       # TypeScript type definitions
│       └── public/          # Static assets
├── packages/                # Shared packages (for future use)
├── .github/
│   └── workflows/           # GitHub Actions workflows
├── .devcontainer/           # VS Code DevContainer config
├── docker-compose.yml       # Local development with Postgres
└── Dockerfile              # Production Docker image
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 10.0.0 or later
- Docker (optional, for local database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd api-os
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the database (optional):
```bash
npm run docker:up
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
- `npm run docker:up` - Start PostgreSQL with Docker
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/health` - Health check with POST data
- `GET /api/apis` - Search APIs with pagination, text search, and filters
- `GET /api/meta` - Retrieve available filter facets and aggregated metrics

### `GET /api/apis`

Query parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `search` | string | Case-insensitive text match against API name and description |
| `page` | number (default `1`) | 1-indexed page number |
| `pageSize` | number (default `20`, max `50`) | Number of records per page |
| `category` | string[] | Repeatable or comma-separated list of category names |
| `auth` | string[] | Repeatable or comma-separated list of auth method names |
| `https` | boolean | `true`/`false` filter for HTTPS support |
| `cors` | enum (`yes`, `no`, `unknown`) | CORS support flag |
| `latencyMin` / `latencyMax` | number | Reliability latency range in ms |
| `uptimeMin` / `uptimeMax` | number | Reliability uptime range (0-100%) |

Responses include the requested page of APIs plus:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Cat Facts",
      "link": "https://catfact.ninja",
      "https": true,
      "cors": "yes",
      "categories": [{ "id": 1, "name": "Animals" }],
      "authMethods": [{ "id": 3, "name": "No-Auth" }],
      "throttling": { "limit": "100 requests", "window": "day" },
      "reliabilityStats": { "latency": 120, "uptime": 99.9, "lastChecked": "2024-01-01T00:00:00.000Z" }
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 4, "hasNextPage": false }
}
```

Invalid query parameter combinations return HTTP 400 with structured validation errors.

### `GET /api/meta`

Returns the available filter options (categories, auth methods, HTTPS/CORS counts) and aggregate health metrics such as total APIs, average latency, average uptime, and the timestamp of the most recent dataset change.

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_TOKEN` - GitHub API token
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - Base URL for NextAuth.js

## Development

### Using DevContainer

1. Open the project in VS Code
2. Use the "Remote-Containers: Reopen in Container" command
3. The development environment will be set up automatically

### Database

The project includes Docker Compose configuration for PostgreSQL:

```bash
# Start PostgreSQL and pgAdmin
npm run docker:up

# Stop containers
npm run docker:down
```

Access pgAdmin at `http://localhost:8080` (credentials in docker-compose.yml).

## Contributing

1. Follow the existing code style and conventions
2. Run `npm run lint` and `npm run type-check` before committing
3. Add tests for new features
4. Update documentation as needed

## License

This project is private and proprietary.