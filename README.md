# Project: Prisma-based API Database

A TypeScript/Node.js project with Prisma ORM and PostgreSQL for managing API data, featuring a comprehensive data ingestion system.

## Overview

This project provides a complete solution for:
- **Database Management**: PostgreSQL with Prisma ORM 7.x
- **Data Ingestion**: Automated script to fetch and populate public APIs
- **API Data**: Comprehensive database of public APIs with categories, authentication methods, and metadata
- **Development Tools**: TypeScript, Jest testing, and database migrations

## Features

- **Prisma ORM 7.x** with PostgreSQL
- **TypeScript** throughout with ts-node for scripts
- **Automated Data Ingestion** from public-apis GitHub repository
- **Comprehensive Error Handling** with retry logic and graceful failures
- **Idempotent Database Operations** using upsert patterns
- **Debug Mode** with raw data snapshots for troubleshooting
- **Jest Testing** with ts-jest preset
- **Database Migrations** and seeding capabilities

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. (Optional) Seed initial data:
```bash
npm run db:seed
```

### Ingest Public APIs Data

Fetch and populate the database with public APIs:

```bash
# Basic ingestion
npm run ingest

# Debug mode with snapshots
npm run ingest:debug
```

## Database Schema

The project uses the following main models:

- **Api**: Core API information (name, description, link, HTTPS, CORS)
- **Category**: API categories with many-to-many relationships
- **Auth**: Authentication methods (API Key, OAuth, etc.)
- **Throttling**: Rate limiting information
- **ReliabilityStats**: Uptime and latency metrics
- **StackTemplate**: JSON template storage

## Available Scripts

### Database Operations
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:seed` - Run database seeding script
- `npm run db:reset` - Reset database and run fresh migrations

### Data Ingestion
- `npm run ingest` - Run public APIs ingestion script
- `npm run ingest:debug` - Run ingestion with debug mode and snapshots

### Development
- `npm test` - Run Jest test suite
- `npm run type-check` - Run TypeScript type checking

## Data Ingestion System

The ingestion script (`scripts/ingest-public-apis.ts`) provides:

### Key Features
- **GitHub Integration**: Fetches data from public-apis repository
- **Markdown Parsing**: Extracts API data from structured tables
- **Idempotent Updates**: Uses upsert operations to prevent duplicates
- **Relationship Management**: Handles many-to-many category/auth associations
- **Progress Tracking**: Real-time logging and summary statistics
- **Error Recovery**: Graceful handling of network and parsing errors
- **Debug Support**: Optional raw snapshot storage for troubleshooting

### Usage
```bash
# Standard ingestion
npm run ingest

# Debug mode with detailed logging
npm run ingest:debug

# Direct execution
ts-node scripts/ingest-public-apis.ts
ts-node scripts/ingest-public-apis.ts --debug
```

### Output
The script provides comprehensive logging:
- Progress updates (every 50 APIs)
- Summary statistics (categories, auth methods, success/error counts)
- Final ingestion report with counts and lists

See [INGESTION.md](./INGESTION.md) for detailed documentation.

## Project Structure

```
project/
├── scripts/
│   └── ingest-public-apis.ts        # Data ingestion script
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── seed.ts                      # Database seeding helpers
│   └── migrations/                  # Database migrations
├── tests/
│   └── models.test.ts               # Model validation tests
├── snapshots/                       # Debug snapshots (created by script)
├── prisma.config.ts                 # Prisma 7.x configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                   # Jest testing configuration
├── INGESTION.md                     # Ingestion system documentation
└── README.md                        # This file
```

## Development

### Database Operations

The project follows Prisma 7.x patterns:

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (destroys all data)
npm run db:reset

# Seed database with initial data
npm run db:seed

# Generate Prisma client after schema changes
npx prisma generate
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Environment Configuration

Required environment variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://engine:engine@localhost:5432/project?schema=public"
```

Optional for development:
```env
# Enable debug logging
DEBUG=true
```

## API Management

The ingestion script handles various data scenarios:

### Data Normalization
- **HTTPS Support**: Converts "yes"/"no" to boolean values
- **CORS Support**: Standardizes "yes"/"no"/"unknown" values
- **URL Processing**: Handles relative and absolute URLs
- **Category Management**: Creates categories on first use
- **Auth Methods**: Processes authentication requirements

### Error Handling
- **Network Timeouts**: 30-second timeout with descriptive errors
- **Parse Failures**: Continues processing other entries
- **Database Errors**: Logs and continues with remaining APIs
- **Validation Issues**: Skips invalid entries with error logging

### Performance
- **Batch Processing**: Updates relationships efficiently
- **Progress Reporting**: Status updates every 50 APIs
- **Memory Management**: Processes large datasets without memory issues

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify DATABASE_URL format and credentials
   - Ensure PostgreSQL is running and accessible
   - Check database permissions

2. **Ingestion Failures**
   - Run `npm run ingest:debug` for detailed logs
   - Check snapshots directory for raw data
   - Verify GitHub repository accessibility

3. **Migration Issues**
   - Reset database: `npm run db:reset`
   - Verify schema.prisma syntax
   - Check for naming conflicts

### Debug Mode

Debug mode provides:
- Raw markdown snapshots in `snapshots/` directory
- Detailed parsing logs
- Error stack traces
- Performance metrics

## Contributing

1. **Code Style**: Follow existing TypeScript patterns
2. **Testing**: Add tests for new features
3. **Documentation**: Update relevant documentation
4. **Error Handling**: Implement proper error handling
5. **Database Changes**: Create migrations for schema changes

## License

This project is proprietary and confidential.

## Support

For issues and questions:
1. Check the [INGESTION.md](./INGESTION.md) documentation
2. Review debug logs and snapshots
3. Verify environment configuration
4. Check GitHub issues and PRs
