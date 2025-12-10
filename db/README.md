# Database Schema

This project uses PostgreSQL with Prisma ORM.

## Schema Decisions

### Api
The core model representing an API.
- **id**: Primary key, auto-increment integer.
- **name**: Name of the API.
- **link**: URL to the API documentation or homepage.
- **https**: Boolean indicating if HTTPS is supported.
- **cors**: String indicating CORS support ("yes", "no", "unknown").
- **metadata**: `description`, `createdAt`, `updatedAt` for tracking changes.

### Categories & Auth
Many-to-Many relationships with `Api`.
- **Category**: Classifies the API (e.g., "Animals", "Development").
- **Auth**: Authentication methods (e.g., "ApiKey", "OAuth", "No-Auth").
- We use Prisma's implicit many-to-many relations for cleaner schema unless specific attributes on the relation are needed.

### Throttling & Reliability
- **Throttling**: 1-to-1 relationship with `Api` to store rate limit info (`limit`, `window`).
- **ReliabilityStats**: 1-to-1 relationship with `Api` to store derived metrics like `uptime`, `latency`.

### StackTemplate
- Placeholder for future stack templates, storing content as JSON.

## Normalization
The schema is normalized:
- Categories and Auth methods are in separate tables to avoid duplication and allow filtering/grouping.
- Throttling and Reliability stats are separated to keep the `Api` table focused on core identity and metadata.
