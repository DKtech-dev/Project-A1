# Setup Guide for Moment Stack Backend

This guide will help you set up the Moment Stack backend API with authentication.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express - Web framework
- bcrypt - Password hashing
- jsonwebtoken - JWT token generation
- pg - PostgreSQL client
- And more...

### 2. Set Up PostgreSQL Database

#### Create Database

Connect to PostgreSQL and create a new database:

```bash
psql -U postgres
```

Then in the PostgreSQL prompt:

```sql
CREATE DATABASE moment_stack;
```

Exit psql:
```
\q
```

#### Verify Connection

Test your PostgreSQL connection:

```bash
psql -U postgres -d moment_stack -c "SELECT version();"
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moment_stack
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important Security Notes:**
- Change `JWT_SECRET` to a long, random string in production
- Never commit your `.env` file to version control
- Use a strong database password

### 4. Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

### 5. Initialize Database Tables

The application will automatically create required tables on first run. You can verify this by starting the server:

```bash
npm run dev
```

You should see:
```
Connected to PostgreSQL database
Database tables initialized
Server is running on port 5000
```

The following tables will be created:
- `users` - User accounts with email, username, and hashed passwords

### 6. Verify Setup

Test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

You should receive:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Running the Application

### Development Mode

With automatic restart on file changes:

```bash
npm run dev:watch
```

Without automatic restart:

```bash
npm run dev
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Error

If you see `Database connection error`, check:

1. PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Database exists:
   ```bash
   psql -U postgres -l | grep moment_stack
   ```

3. Credentials in `.env` are correct

4. PostgreSQL is accepting connections:
   ```bash
   psql -U postgres -d moment_stack -c "SELECT 1;"
   ```

### Port Already in Use

If port 5000 is already in use:

1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

### JWT Secret Not Set Error

If you see `JWT_SECRET is not defined`, ensure:

1. `.env` file exists in the project root
2. `JWT_SECRET` is set in `.env`
3. Server was restarted after editing `.env`

## Next Steps

1. Test the authentication endpoints using the examples in [TESTING.md](./TESTING.md)
2. Read the API documentation in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Start building your application features!

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive information
2. **Use strong JWT secrets** - Minimum 32 characters, random string
3. **Use HTTPS in production** - Encrypt data in transit
4. **Set secure CORS origins** - Don't use `*` in production
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Use environment-based configs** - Different settings for dev/prod
7. **Implement rate limiting** - Prevent brute force attacks (future enhancement)
8. **Enable PostgreSQL SSL** - For production databases

## Optional Enhancements

Consider adding these features for production:

1. **Token Refresh** - Implement refresh tokens for extended sessions
2. **Rate Limiting** - Prevent abuse with express-rate-limit
3. **Email Verification** - Verify user emails during registration
4. **Password Reset** - Allow users to reset forgotten passwords
5. **Session Management** - Track active sessions
6. **Audit Logging** - Log security-relevant events
7. **Two-Factor Authentication** - Add extra security layer

## Getting Help

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Review the troubleshooting section above
5. Check that all dependencies are installed correctly

## Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run dev:watch` for auto-reload
3. Test endpoints using curl or Postman
4. Build with `npm run build` before committing
5. Commit your changes to Git

Happy coding! 🚀
