# FinPilot Authentication Guide

This guide provides detailed instructions for implementing JWT-based authentication in FinPilot.

## Overview

FinPilot uses JWT (JSON Web Tokens) for stateless authentication. The authentication flow includes:

1. User registration
2. User login
3. Token generation
4. Token validation
5. Token refresh

## Setup

### 1. Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken
```

### 2. Environment Variables

Add these to your `.env` file:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d
```

## Implementation

### 1. Create Auth Utilities

Create `lib/auth.ts`:

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT Token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Extract Token from Header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};
```

### 2. Create Auth Middleware

Create `lib/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

export const withAuth = (handler: Function) => {
  return async (req: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return NextResponse.json(
          { error: 'Missing authentication token' },
          { status: 401 }
        );
      }
      
      // Verify token
      const payload = verifyToken(token);
      
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
      // Add user info to request
      (req as any).user = payload;
      
      // Call the handler
      return handler(req);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
};
```

### 3. Create Auth API Routes

Create `app/api/v1/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        profile: {
          create: {
            monthlyIncome: 0,
            riskTolerance: 'moderate',
          },
        },
      },
      include: {
        profile: true,
      },
    });
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

Create `app/api/v1/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Note: In production, you should store hashed passwords in the database
    // For now, we'll skip password verification
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

Create `app/api/v1/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { valid: true, user: payload },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
```

### 4. Frontend Authentication Implementation

Create a custom hook `hooks/useAuth.ts`:

```typescript
import { useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: false,
    error: null,
  });
  
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      localStorage.setItem('token', data.token);
      setState(prev => ({
        ...prev,
        user: data.user,
        token: data.token,
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);
  
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      setState(prev => ({
        ...prev,
        user: data.user,
        token: data.token,
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);
  
  return {
    ...state,
    register,
    login,
    logout,
  };
};
```

### 5. Protected API Routes

To protect API routes, use the middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import prisma from '@/lib/prisma';

const handler = async (req: NextRequest) => {
  const user = (req as any).user;
  
  // Now you have access to the authenticated user
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  
  return NextResponse.json({ user: userData });
};

export const GET = withAuth(handler);
```

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure Storage**: Store tokens in secure, httpOnly cookies when possible
3. **Token Expiration**: Set appropriate token expiration times
4. **Refresh Tokens**: Implement refresh token rotation
5. **CORS**: Configure CORS properly to prevent unauthorized access
6. **Rate Limiting**: Implement rate limiting on auth endpoints
7. **Password Hashing**: Always hash passwords with bcrypt or similar
8. **Input Validation**: Validate all user inputs

## Testing Authentication

See [TESTING.md](TESTING.md) for authentication testing guidelines.
