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

## Features

- **User Authentication:** JWT-based authentication with bcrypt password hashing
- **User Registration & Login:** Secure user account management
- **Protected Routes:** Middleware for authenticating API requests
- **Input Validation:** Email, password, and username validation
- **Error Handling:** Comprehensive error handling with custom error classes
- **Database Integration:** PostgreSQL with automatic table creation
- **TypeScript:** Full type safety and IntelliSense support

## API Endpoints

### Public Endpoints
- `GET /` - Health check
- `GET /api/health` - API health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (Require Authentication)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. After logging in or registering, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN` environment variable).

## Database

Uses PostgreSQL. The application automatically creates the required tables on startup.

Required tables:
- `users` - User accounts with email, password, username

Make sure PostgreSQL is running and configured in your environment variables.