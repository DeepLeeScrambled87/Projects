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