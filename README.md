# Moment Stack Backend

Node.js/Express TypeScript backend API for Moment Stack.

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

3. Build the project:
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

## Project Structure

```
src/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Business logic handlers
├── middleware/      # Express middleware (auth, error handling)
├── models/          # Database models
├── routes/          # API route definitions
├── utils/           # Helper utilities
└── server.ts        # Application entry point
```

## Environment Variables

See `.env.example` for available configuration options.

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - API health check

## Database

Uses PostgreSQL. Make sure PostgreSQL is running and configured in your environment variables.