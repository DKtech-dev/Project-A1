# Testing the Authentication API

This document provides examples for testing the authentication endpoints using `curl` or any HTTP client.

## Prerequisites

1. Ensure PostgreSQL is running and configured in your `.env` file
2. Start the development server:
   ```bash
   npm run dev
   ```

The API should be running on `http://localhost:5000` (or your configured PORT).

## Test Scenarios

### 1. Health Check

Test if the server is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. User Registration

Register a new user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "testuser"
  }'
```

Expected response (save the token for later use):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. User Login

Login with existing credentials:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get User Profile (Protected)

Get the authenticated user's profile. Replace `YOUR_JWT_TOKEN` with the token from login/register:

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 5. Update User Profile (Protected)

Update the authenticated user's profile:

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "newusername",
    "email": "newemail@example.com"
  }'
```

Expected response:
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

---

### 6. Logout (Protected)

Logout the current user:

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note:** After logout, the client should discard the token. The server doesn't maintain a blacklist of tokens (stateless JWT).

---

## Error Testing

### Test Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123",
    "username": "testuser"
  }'
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "Invalid email format"
  }
}
```

---

### Test Weak Password

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "weak",
    "username": "testuser2"
  }'
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "Password must be at least 8 characters long, Password must contain at least one uppercase letter, Password must contain at least one number"
  }
}
```

---

### Test Duplicate Email

Try registering with an email that already exists:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "anotheruser"
  }'
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "Email already exists"
  }
}
```

---

### Test Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123"
  }'
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

---

### Test Missing Authorization Header

```bash
curl http://localhost:5000/api/auth/profile
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "No authorization header provided"
  }
}
```

---

### Test Invalid Token

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```

Expected error:
```json
{
  "success": false,
  "error": {
    "message": "Invalid token"
  }
}
```

---

## Using Postman or Insomnia

1. Import the following endpoints into your HTTP client
2. Set the `Authorization` header as `Bearer <token>` for protected routes
3. Set `Content-Type` header to `application/json` for POST/PUT requests

### Environment Variables

Set up these variables in your HTTP client:
- `base_url`: `http://localhost:5000`
- `token`: (will be updated after login/register)

This makes it easier to test the API across different requests.

---

## Automated Testing Script

You can also create a bash script to automate testing:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "1. Testing health check..."
curl -s $BASE_URL/api/health | jq

echo -e "\n2. Registering new user..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auto@test.com",
    "password": "AutoTest123",
    "username": "autouser"
  }')

echo $RESPONSE | jq

TOKEN=$(echo $RESPONSE | jq -r '.data.token')

echo -e "\n3. Getting profile with token..."
curl -s $BASE_URL/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n4. Updating profile..."
curl -s -X PUT $BASE_URL/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "updateduser"
  }' | jq

echo -e "\n5. Logging out..."
curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

Save this as `test-auth.sh`, make it executable (`chmod +x test-auth.sh`), and run it (`./test-auth.sh`).

**Note:** This script requires `jq` for JSON formatting. Install it with:
- Ubuntu/Debian: `sudo apt-get install jq`
- macOS: `brew install jq`
