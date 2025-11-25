# Moment Stack API Documentation

## Authentication API

Base URL: `/api/auth`

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account with email, password, and username.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe"
}
```

**Validation Rules:**
- Email: Must be a valid email format
- Password: Must be at least 8 characters, contain uppercase, lowercase, and number
- Username: 3-30 characters, alphanumeric and underscores only

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Password must be at least 8 characters long"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists"
  }
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password to receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

---

### 3. User Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout current user (client should discard the token).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "No authorization header provided"
  }
}
```

---

### 4. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Get the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Token has expired"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "message": "User not found"
  }
}
```

---

### 5. Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Description:** Update the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "username": "newusername"
}
```

**Note:** All fields are optional, but at least one must be provided.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "newemail@example.com",
      "username": "newusername",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "At least one field (email or username) is required"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists"
  }
}
```

---

## Authentication Flow

1. **Registration:** User registers with email, password, and username. System returns JWT token.
2. **Login:** User logs in with credentials. System returns JWT token.
3. **Authenticated Requests:** Include the JWT token in the Authorization header as `Bearer <token>`.
4. **Token Expiration:** Tokens expire after the time specified in `JWT_EXPIRES_IN` (default: 24h).
5. **Logout:** Client discards the token.

## Security Features

- **Password Hashing:** Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens:** Secure token-based authentication with configurable expiration
- **Input Validation:** 
  - Email format validation
  - Password strength requirements (min 8 chars, uppercase, lowercase, number)
  - Username validation (3-30 chars, alphanumeric and underscores)
- **Error Handling:** Consistent error responses with appropriate HTTP status codes
- **Database Constraints:** Unique email constraint prevents duplicate accounts

## Token Expiration

Tokens expire based on the `JWT_EXPIRES_IN` environment variable (default: 24 hours).

When a token expires, requests will return:
```json
{
  "success": false,
  "error": {
    "message": "Token has expired"
  }
}
```

The client should prompt the user to login again to obtain a new token.

## Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if the API server is running.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
