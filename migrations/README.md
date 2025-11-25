# Database Migrations

This directory contains SQL migration files for the Moment Stack database schema.

## Overview

The database uses PostgreSQL with the PostGIS extension for geospatial functionality. Migrations are executed in alphabetical order and tracked in a `migrations` table to prevent duplicate execution.

## Migration Files

### 001_init_postgis.sql
- Enables the PostGIS extension
- Verifies PostGIS installation

### 002_create_core_tables.sql
- Creates all core application tables:
  - `users` - User accounts with authentication
  - `moments` - User-created moments with geospatial location
  - `reactions` - User reactions to moments
  - `story_threads` - Extended narratives for moments
  - `thread_comments` - Comments within threads
  - `user_profiles` - Extended user preferences
- Establishes foreign key relationships
- Creates indexes for performance (including geospatial GIST index)

## Running Migrations

To execute all pending migrations:

```bash
npm run migrate
```

This will:
1. Connect to the database using credentials from `.env`
2. Create a `migrations` tracking table if it doesn't exist
3. Run any SQL files that haven't been executed yet
4. Record each executed migration in the tracking table

## Database Schema

### Users Table
- Stores user authentication and profile information
- Indexed on email and username for fast lookups

### Moments Table
- Contains user-generated moments with optional photo
- **Geospatial column**: `location` (GEOGRAPHY Point, SRID 4326)
- `radius` defines visibility distance in meters
- GIST index on location for efficient proximity queries

### Reactions Table
- Links users to moments they've reacted to
- Supports various reaction types (likes, emojis, etc.)

### Story Threads & Comments
- Allows extended discussions on moments
- Hierarchical structure: moments → threads → comments

### User Profiles
- Extended user preferences
- `favorite_moods` stored as text array
- `search_radius` for default proximity searches

## Geospatial Queries

The schema supports common geospatial operations:

### Find moments within radius
```sql
SELECT * FROM moments
WHERE ST_DWithin(
  location,
  ST_GeogFromText('SRID=4326;POINT(lng lat)'),
  radius_in_meters
);
```

### Distance between points
```sql
SELECT ST_Distance(
  location,
  ST_GeogFromText('SRID=4326;POINT(lng lat)')
) as distance_meters
FROM moments;
```

## Adding New Migrations

1. Create a new SQL file with sequential numbering: `003_description.sql`
2. Write idempotent SQL (use `IF NOT EXISTS` where possible)
3. Test locally before committing
4. Run `npm run migrate` to apply

## Rollback Strategy

This migration system does not include automatic rollbacks. To revert changes:
1. Create a new migration with inverse operations
2. Or manually execute SQL to undo changes
3. Remove the migration record from the `migrations` table if needed
