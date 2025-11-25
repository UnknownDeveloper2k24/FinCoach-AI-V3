# FinPilot Frontend Integration Guide

This guide provides detailed instructions for integrating the FinPilot backend API with the frontend UI components.

## Overview

The FinPilot backend provides 13 specialized agents through RESTful APIs. The frontend needs to connect to these APIs to display financial data and enable user interactions.

## API Base URL

```
http://localhost:3000/api/v1
```

## Integration Steps

### 1. User Management Integration

#### Create User
```typescript
// POST /api/v1/users
const createUser = async (userData: {
  email: string;
  name: string;
  phone?: string;
}) => {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};
```

#### Get User Profile
```typescript
// GET /api/v1/users/:id
const getUserProfile = async (userId: string) => {
  const response = await fetch(`/api/v1/users/${userId}`);
  return response.json();
};
```

### 2. Dashboard Integration

#### Display Balance
```typescript
// GET /api/v1/cashflow?userId=<userId>
const getCashflowData = async (userId: string) => {
  const response = await fetch(`/api/v1/cashflow?userId=${userId}`);
  return response.json();
};
```

#### Display Safe-to-Spend
```typescript
// Use the safeToSpendToday from cashflow response
const displaySafeToSpend = (cashflowData) => {
  return `₹${cashflowData.safeToSpendToday.toFixed(2)}`;
};
```

### 3. Jar System Integration

#### Display Jars
```typescript
// GET /api/v1/jars?userId=<userId>
const getJars = async (userId: string) => {
  const response = await fetch(`/api/v1/jars?userId=${userId}`);
  return response.json();
};
```

#### Create New Jar
```typescript
// POST /api/v1/jars
const createJar = async (jarData: {
  userId: string;
  name: string;
  targetAmount: number;
  isEssential: boolean;
}) => {
  const response = await fetch('/api/v1/jars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jarData),
  });
  return response.json();
};
```

### 4. Goals Integration

#### Display Goals
```typescript
// GET /api/v1/goals?userId=<userId>
const getGoals = async (userId: string) => {
  const response = await fetch(`/api/v1/goals?userId=${userId}`);
  return response.json();
};
```

#### Create Goal
```typescript
// POST /api/v1/goals
const createGoal = async (goalData: {
  userId: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  category: string;
}) => {
  const response = await fetch('/api/v1/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goalData),
  });
  return response.json();
};
```

### 5. Spending Analysis Integration

#### Display Spending Patterns
```typescript
// GET /api/v1/spending/patterns?userId=<userId>
const getSpendingPatterns = async (userId: string) => {
  const response = await fetch(`/api/v1/spending/patterns?userId=${userId}`);
  return response.json();
};
```

### 6. Budget Integration

#### Display Budget Categories
```typescript
// GET /api/v1/budget?userId=<userId>
const getBudgetCategories = async (userId: string) => {
  const response = await fetch(`/api/v1/budget?userId=${userId}`);
  return response.json();
};
```

### 7. Alerts Integration

#### Display Alerts
```typescript
// GET /api/v1/alerts?userId=<userId>
const getAlerts = async (userId: string) => {
  const response = await fetch(`/api/v1/alerts?userId=${userId}`);
  return response.json();
};
```

#### Mark Alert as Read
```typescript
// PUT /api/v1/alerts/:id/read
const markAlertAsRead = async (alertId: string) => {
  const response = await fetch(`/api/v1/alerts/${alertId}/read`, {
    method: 'PUT',
  });
  return response.json();
};
```

### 8. AI Coach Integration

#### Get Financial Insights
```typescript
// GET /api/v1/coach/insights?userId=<userId>
const getFinancialInsights = async (userId: string) => {
  const response = await fetch(`/api/v1/coach/insights?userId=${userId}`);
  return response.json();
};
```

#### Get Personalized Advice
```typescript
// POST /api/v1/coach/advice
const getFinancialAdvice = async (userId: string, query: string) => {
  const response = await fetch('/api/v1/coach/advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, query }),
  });
  return response.json();
};
```

### 9. Voice Interaction Integration

#### Process Voice Query
```typescript
// POST /api/v1/voice/query
const processVoiceQuery = async (userId: string, query: string) => {
  const response = await fetch('/api/v1/voice/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, query }),
  });
  return response.json();
};
```

### 10. Asset Management Integration

#### Display Assets
```typescript
// GET /api/v1/assets?userId=<userId>
const getAssets = async (userId: string) => {
  const response = await fetch(`/api/v1/assets?userId=${userId}`);
  return response.json();
};
```

#### Analyze Portfolio
```typescript
// POST /api/v1/assets/analyze
const analyzePortfolio = async (userId: string) => {
  const response = await fetch('/api/v1/assets/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return response.json();
};
```

### 11. Market Forecasting Integration

#### Get Market Forecasts
```typescript
// GET /api/v1/market/forecasts?userId=<userId>
const getMarketForecasts = async (userId: string) => {
  const response = await fetch(`/api/v1/market/forecasts?userId=${userId}`);
  return response.json();
};
```

#### Get Investment Strategy
```typescript
// POST /api/v1/market/strategy
const getInvestmentStrategy = async (userId: string) => {
  const response = await fetch('/api/v1/market/strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return response.json();
};
```

## Error Handling

All API responses follow a consistent error format:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Handle errors
const handleApiError = (error: any) => {
  if (error.error) {
    console.error('API Error:', error.error);
    // Show user-friendly error message
  }
};
```

## Authentication

See [AUTHENTICATION.md](AUTHENTICATION.md) for JWT-based authentication implementation.

## Best Practices

1. **Caching**: Cache frequently accessed data (user profile, jars, goals) to reduce API calls
2. **Error Handling**: Always handle API errors gracefully with user-friendly messages
3. **Loading States**: Show loading indicators while fetching data
4. **Real-time Updates**: Use WebSocket for real-time updates on alerts and cashflow
5. **Rate Limiting**: Implement client-side rate limiting to prevent excessive API calls

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guidelines.
