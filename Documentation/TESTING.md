# FinPilot Testing Guide

This guide provides comprehensive testing strategies for the FinPilot backend and frontend.

## Testing Stack

- **Unit Tests**: Jest
- **Integration Tests**: Jest + Supertest
- **E2E Tests**: Playwright
- **API Testing**: Postman/Insomnia

## Setup

### 1. Install Testing Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest
npm install --save-dev @playwright/test
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 2. Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'app/**/*.ts',
    'lib/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

## Unit Tests

### 1. Auth Utilities Tests

Create `__tests__/lib/auth.test.ts`:

```typescript
import { generateToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth';

describe('Auth Utilities', () => {
  describe('Token Generation and Verification', () => {
    it('should generate a valid token', () => {
      const payload = { userId: 'test-user', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
    
    it('should verify a valid token', () => {
      const payload = { userId: 'test-user', email: 'test@example.com' };
      const token = generateToken(payload);
      const verified = verifyToken(token);
      
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });
    
    it('should return null for invalid token', () => {
      const verified = verifyToken('invalid-token');
      expect(verified).toBeNull();
    });
  });
  
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });
    
    it('should compare password correctly', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);
      
      expect(isMatch).toBe(true);
    });
    
    it('should not match incorrect password', async () => {
      const password = 'test-password-123';
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword('wrong-password', hashed);
      
      expect(isMatch).toBe(false);
    });
  });
});
```

### 2. Cashflow Calculation Tests

Create `__tests__/lib/cashflow.test.ts`:

```typescript
describe('Cashflow Calculations', () => {
  it('should calculate safe-to-spend correctly', () => {
    const balance = 10000;
    const dailyBurnRate = 500;
    const daysUntilNextIncome = 5;
    
    const requiredBuffer = dailyBurnRate * daysUntilNextIncome;
    const safeToSpend = balance - requiredBuffer;
    
    expect(safeToSpend).toBe(7500);
  });
  
  it('should calculate runout days correctly', () => {
    const balance = 5000;
    const dailyBurnRate = 500;
    
    const runoutDays = Math.floor(balance / dailyBurnRate);
    
    expect(runoutDays).toBe(10);
  });
  
  it('should handle zero burn rate', () => {
    const balance = 5000;
    const dailyBurnRate = 0;
    
    const runoutDays = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : Infinity;
    
    expect(runoutDays).toBe(Infinity);
  });
});
```

## Integration Tests

### 1. User Registration API Test

Create `__tests__/api/auth.integration.test.ts`:

```typescript
import { createMocks } from 'node-mocks-http';
import prisma from '@/lib/prisma';

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({});
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user.email).toBe(userData.email);
      expect(data.token).toBeDefined();
    });
    
    it('should not register duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      // First registration
      await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      // Second registration with same email
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      expect(response.status).toBe(409);
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      // Register first
      await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      // Login
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.token).toBeDefined();
    });
  });
});
```

### 2. Jar System API Test

Create `__tests__/api/jars.integration.test.ts`:

```typescript
describe('Jar System API Integration Tests', () => {
  let userId: string;
  let token: string;
  
  beforeAll(async () => {
    // Create test user and get token
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jar-test@example.com',
        password: 'password123',
        name: 'Jar Test User',
      }),
    });
    
    const data = await response.json();
    userId = data.user.id;
    token = data.token;
  });
  
  describe('POST /api/v1/jars', () => {
    it('should create a new jar', async () => {
      const jarData = {
        userId,
        name: 'Emergency Fund',
        targetAmount: 50000,
        isEssential: true,
      };
      
      const response = await fetch('/api/v1/jars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(jarData),
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.jar.name).toBe(jarData.name);
      expect(data.jar.targetAmount).toBe(jarData.targetAmount);
    });
  });
  
  describe('GET /api/v1/jars', () => {
    it('should get all jars for user', async () => {
      const response = await fetch(`/api/v1/jars?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.jars)).toBe(true);
    });
  });
});
```

## API Testing with Postman

### 1. Create Postman Collection

Create `postman/FinPilot.postman_collection.json`:

```json
{
  "info": {
    "name": "FinPilot API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"name\": \"Test User\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Jars",
      "item": [
        {
          "name": "Get All Jars",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/jars?userId={{userId}}",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "jars"],
              "query": [
                {
                  "key": "userId",
                  "value": "{{userId}}"
                }
              ]
            }
          }
        },
        {
          "name": "Create Jar",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"name\": \"Emergency Fund\",\n  \"targetAmount\": 50000,\n  \"isEssential\": true\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/jars",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "jars"]
            }
          }
        }
      ]
    },
    {
      "name": "Cashflow",
      "item": [
        {
          "name": "Get Cashflow Analysis",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/cashflow?userId={{userId}}",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "cashflow"],
              "query": [
                {
                  "key": "userId",
                  "value": "{{userId}}"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Goals",
      "item": [
        {
          "name": "Get All Goals",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/goals?userId={{userId}}",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "goals"],
              "query": [
                {
                  "key": "userId",
                  "value": "{{userId}}"
                }
              ]
            }
          }
        },
        {
          "name": "Create Goal",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"name\": \"Buy a Car\",\n  \"targetAmount\": 500000,\n  \"targetDate\": \"2026-12-31\",\n  \"category\": \"vehicle\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/goals",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "goals"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "userId",
      "value": ""
    }
  ]
}
```

## E2E Testing with Playwright

Create `e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register and login successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="name"]', 'Test User');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // Verify user is logged in
    const userMenu = await page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });
  
  test('should show error for duplicate email', async ({ page }) => {
    // Register first user
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', 'duplicate@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="name"]', 'First User');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    
    // Try to register with same email
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', 'duplicate@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="name"]', 'Second User');
    await page.click('button[type="submit"]');
    
    // Verify error message
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText('User already exists');
  });
});
```

## Running Tests

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### E2E Tests
```bash
npx playwright test
```

### Coverage Report
```bash
npm test -- --coverage
```

## Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: finpilot_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/finpilot_test
      
      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/finpilot_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Services**: Mock API calls and database queries
3. **Clear Test Names**: Use descriptive test names
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Test Edge Cases**: Test boundary conditions and error cases
6. **Keep Tests Fast**: Optimize test performance
7. **Maintain Tests**: Update tests when code changes
