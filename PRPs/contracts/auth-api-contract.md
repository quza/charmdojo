# Authentication API Contract

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Base URL:** `/api/auth`

---

## Overview

Authentication endpoints for user signup, signin, password reset, and OAuth integration using Supabase Auth.

---

## Endpoints

### 1. Sign Up with Email

**Endpoint:** `POST /api/auth/signup`  
**Purpose:** Create new user account with email/password  
**Authentication:** None (public endpoint)

#### Request

```typescript
interface SignUpRequest {
  email: string;      // Valid email format, required
  password: string;   // Min 8 chars, required
  name?: string;      // Max 100 chars, optional
}
```

**Validation Rules:**
- `email`: Required, valid email format, max 255 chars
- `password`: Required, min 8 chars, max 72 chars, must contain at least one letter and one number
- `name`: Optional, max 100 chars

#### Response (201 Created)

```typescript
interface SignUpResponse {
  user: {
    id: string;           // UUID
    email: string;
    name: string | null;
    created_at: string;   // ISO 8601
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;   // Unix timestamp
    expires_in: number;   // Seconds
  };
}
```

#### Error Responses

**400 Bad Request - Invalid Input**
```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**409 Conflict - Email Already Exists**
```json
{
  "error": "email_already_exists",
  "message": "An account with this email already exists",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**429 Too Many Requests - Rate Limited**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many signup attempts. Please try again in 1 hour.",
  "retry_after": 3600,
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 2. Sign In with Email

**Endpoint:** `POST /api/auth/signin`  
**Purpose:** Authenticate existing user  
**Authentication:** None (public endpoint)

#### Request

```typescript
interface SignInRequest {
  email: string;     // Required
  password: string;  // Required
}
```

#### Response (200 OK)

```typescript
interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
  };
}
```

#### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**429 Too Many Requests - Rate Limited**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many failed login attempts. Please try again in 15 minutes.",
  "retry_after": 900,
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 3. Sign In with OAuth

**Endpoint:** `POST /api/auth/oauth`  
**Purpose:** Initiate OAuth flow (Google, Facebook)  
**Authentication:** None (public endpoint)

#### Request

```typescript
interface OAuthRequest {
  provider: 'google' | 'facebook';  // Required
  redirectTo?: string;               // Optional, default: '/main-menu'
}
```

#### Response (200 OK)

```typescript
interface OAuthResponse {
  url: string;  // OAuth provider authorization URL
}
```

**Note:** Frontend redirects to this URL. OAuth callback handled at `/auth/callback`.

---

### 4. Password Reset Request

**Endpoint:** `POST /api/auth/reset-password`  
**Purpose:** Request password reset email  
**Authentication:** None (public endpoint)

#### Request

```typescript
interface ResetPasswordRequest {
  email: string;  // Required
}
```

#### Response (200 OK)

```typescript
interface ResetPasswordResponse {
  message: string;  // "If that email exists, we've sent a reset link"
}
```

**Note:** Always returns 200 for security (no email enumeration).

---

### 5. Update Password

**Endpoint:** `POST /api/auth/update-password`  
**Purpose:** Update password with reset token or while authenticated  
**Authentication:** Required (reset token OR session token)

#### Request

```typescript
interface UpdatePasswordRequest {
  password: string;      // New password, min 8 chars, required
  token?: string;        // Reset token (if using reset flow)
}
```

#### Response (200 OK)

```typescript
interface UpdatePasswordResponse {
  message: string;  // "Password updated successfully"
}
```

#### Error Responses

**400 Bad Request - Invalid Token**
```json
{
  "error": "invalid_token",
  "message": "Reset token is invalid or expired",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 6. Sign Out

**Endpoint:** `POST /api/auth/signout`  
**Purpose:** End user session  
**Authentication:** Required (Bearer token)

#### Request

No body required.

#### Response (200 OK)

```typescript
interface SignOutResponse {
  message: string;  // "Signed out successfully"
}
```

---

### 7. Refresh Session

**Endpoint:** `POST /api/auth/refresh`  
**Purpose:** Refresh access token using refresh token  
**Authentication:** None (uses refresh token in body)

#### Request

```typescript
interface RefreshRequest {
  refresh_token: string;  // Required
}
```

#### Response (200 OK)

```typescript
interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}
```

---

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful signin, password reset, signout, refresh |
| 201 | Created | Successful signup |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Invalid credentials, expired token |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/signup` | 5 attempts | 1 hour per IP |
| `/signin` | 5 attempts | 15 minutes per email |
| `/reset-password` | 3 attempts | 1 hour per email |
| `/oauth` | 10 attempts | 5 minutes per IP |

---

## Integration Notes

### Backend (Next.js API Routes)

```typescript
// src/app/api/auth/signup/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  name: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  // Validate input
  // Call Supabase Auth
  // Create user profile
  // Return response
}
```

### Frontend (React/TypeScript)

```typescript
// src/lib/api/auth.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().max(100).optional(),
});

export type SignUpRequest = z.infer<typeof signUpSchema>;

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

---

## Security Considerations

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one letter and one number
   - Maximum 72 characters (bcrypt limit)

2. **Rate Limiting:**
   - Implement at API route level
   - Use IP-based throttling for public endpoints
   - Use email-based throttling for signin attempts

3. **Session Management:**
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - Implement automatic token refresh on frontend

4. **OAuth Security:**
   - PKCE flow for OAuth 2.0
   - State parameter for CSRF protection
   - Validate redirect URLs

5. **Error Messages:**
   - Don't reveal whether email exists (for password reset)
   - Generic error messages for invalid credentials
   - Log detailed errors server-side for debugging

---

## Testing Checklist

- [ ] Successful signup with valid data
- [ ] Signup validation errors (invalid email, weak password)
- [ ] Signup with duplicate email returns 409
- [ ] Rate limiting triggers after 5 signup attempts
- [ ] Successful signin with valid credentials
- [ ] Signin fails with invalid credentials
- [ ] Signin rate limiting after 5 failed attempts
- [ ] OAuth flow initiates correctly
- [ ] OAuth callback handles success/failure
- [ ] Password reset email sent (or appears to be sent)
- [ ] Password update with valid token
- [ ] Password update fails with expired token
- [ ] Signout clears session
- [ ] Token refresh works with valid refresh_token
- [ ] Token refresh fails with invalid refresh_token

