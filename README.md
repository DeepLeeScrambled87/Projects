# API OS - API Discovery Platform

GenAI Language Translator Agent with Prisma ORM and PostgreSQL.

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure database connection:
```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Run migrations:
```bash
npx prisma migrate deploy
```

5. Seed the database (optional):
```bash
npx prisma db seed
```

## Development

### Running Tests
```bash
npm test
```

### Database Management

Generate Prisma Client after schema changes:
```bash
npx prisma generate
```

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

## Database Schema

See [db/README.md](./db/README.md) for detailed schema documentation.

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma      # Prisma schema definition
│   ├── seed.ts            # Database seeding script
│   └── migrations/        # Database migrations
├── tests/                 # Test files
├── db/                    # Database documentation
└── prisma.config.ts       # Prisma configuration
```
