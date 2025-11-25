# Moment Stack Backend

Node.js/Express TypeScript backend API for Moment Stack with geospatial support using PostGIS.

## Features

- **Moments CRUD Operations**: Create, read, update, and delete moments
- **Geospatial Queries**: Find moments within a specific radius using PostGIS
- **Advanced Filtering**: Filter by mood, date range, and user
- **Pagination**: Efficient pagination for large datasets
- **User Authentication**: Mock authentication middleware (ready for real auth)
- **Error Handling**: Comprehensive error handling with structured logging
- **Database Migrations**: Automated database setup with PostGIS support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL with PostGIS extension:
```sql
-- Make sure your database has the PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

4. Run database migrations:
```bash
npm run migrate:dev
```

5. Build the project:
```bash
npm run build
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

Or with file watching:
```bash
npm run dev:watch
```

## Production

Build and start production server:
```bash
npm run build
npm start
```

## Database Management

Run migrations:
```bash
npm run migrate:dev      # Development
npm run migrate          # Production
```

Reset database (drops all tables and recreates):
```bash
npm run reset-db:dev     # Development
npm run reset-db         # Production
```

## Project Structure

```
src/
├── config/          # Configuration files (database, migrations)
├── controllers/     # Business logic handlers
├── middleware/      # Express middleware (auth, error handling)
├── models/          # Database models and types
├── routes/          # API route definitions
├── utils/           # Helper utilities
└── server.ts        # Application entry point

migrations/
└── *.sql            # Database migration files
```

## Environment Variables

See `.env.example` for available configuration options.

## API Endpoints

### Health Check
- `GET /` - Server health check
- `GET /api/health` - API health check

### Moments CRUD

#### Create Moment (Protected)
```http
POST /api/moments
Content-Type: application/json

{
  "title": "Beautiful Sunset",
  "description": "Amazing sunset at the beach today",
  "photo_url": "https://example.com/photo.jpg",
  "mood": "happy",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

#### Get Single Moment
```http
GET /api/moments/:id
```

#### Update Moment (Protected)
```http
PUT /api/moments/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Moment (Protected)
```http
DELETE /api/moments/:id
```

#### List Moments with Filters
```http
GET /api/moments?moods=happy,inspiring&start_date=2023-01-01&end_date=2023-12-31&limit=20&offset=0
```

**Query Parameters:**
- `moods`: Comma-separated list of moods (happy, inspiring, thoughtful, excited, grateful, peaceful)
- `start_date`: ISO date string (YYYY-MM-DD or ISO 8601)
- `end_date`: ISO date string (YYYY-MM-DD or ISO 8601)
- `user_id`: Filter by specific user ID
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

### Geospatial Search

#### Find Nearby Moments
```http
GET /api/moments/nearby?lat=37.7749&lng=-122.4194&radius=1000&moods=happy&limit=20
```

**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Radius in meters (default: 1000, max: 100000)
- `moods`: Comma-separated list of moods (optional)
- `start_date`: ISO date string (optional)
- `end_date`: ISO date string (optional)
- `user_id`: Filter by specific user ID (optional)
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Moment Object

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Moment Title",
  "description": "Moment description",
  "photo_url": "https://example.com/photo.jpg",
  "mood": "happy",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z",
  "username": "demo_user",
  "avatar_url": "https://example.com/avatar.jpg",
  "distance_meters": 500,
  "reaction_count": 10,
  "thread_count": 3
}
```

## Error Handling

The API uses structured error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  }
}
```

## Database Schema

### Tables
- `users`: User accounts
- `moments`: Moment records with geospatial data
- `reactions`: User reactions to moments
- `threads`: Discussion threads for moments

### Geospatial Features
- Uses PostGIS `GEOGRAPHY(POINT, 4326)` for location storage
- `ST_DWithin` for proximity searches
- `ST_Distance` for distance calculations
- GIST indexes for spatial queries

## Development Notes

- **Authentication**: Currently uses mock authentication middleware. Replace with real JWT/session-based auth in production.
- **Validation**: Comprehensive input validation for all endpoints
- **Logging**: Structured logging with different levels
- **Error Handling**: Custom error classes with proper HTTP status codes
- **TypeScript**: Full TypeScript support with strict mode enabled

## Database Requirements

- PostgreSQL 12+ with PostGIS 3.0+
- The `postgis` extension must be enabled in your database

## Testing the API

You can test the API using tools like curl, Postman, or Insomnia. Here are some example requests:

```bash
# Create a moment
curl -X POST http://localhost:5000/api/moments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Moment",
    "description": "This is a test moment",
    "photo_url": "https://example.com/test.jpg",
    "mood": "happy",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'

# Find nearby moments
curl "http://localhost:5000/api/moments/nearby?lat=37.7749&lng=-122.4194&radius=5000"
```