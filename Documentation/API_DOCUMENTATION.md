# FinPilot API Documentation

Complete API reference for all FinPilot endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except auth endpoints) require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

```json
{
  "data": {},
  "error": null,
  "status": 200
}
```

## Error Handling

Error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login User

**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Verify Token

**GET** `/auth/verify`

Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "userId": "user-123",
    "email": "user@example.com"
  }
}
```

---

## User Management Endpoints

### Get User Profile

**GET** `/users/:id`

Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "profile": {
      "monthlyIncome": 50000,
      "riskTolerance": "moderate",
      "savingsGoal": 10000
    }
  }
}
```

### Update User Profile

**PUT** `/users/:id`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "monthlyIncome": 60000,
  "riskTolerance": "high"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": {
      "monthlyIncome": 60000,
      "riskTolerance": "high"
    }
  }
}
```

---

## Cashflow Endpoints

### Get Cashflow Analysis

**GET** `/cashflow?userId=<userId>`

Get current cashflow analysis including safe-to-spend and runout prediction.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "cashflow": {
    "currentBalance": 25000,
    "dailyBurnRate": 500,
    "safeToSpendToday": 15000,
    "runoutDays": 50,
    "nextIncomeDate": "2025-12-01",
    "daysUntilNextIncome": 6,
    "trend": "stable",
    "microActions": [
      "Reduce daily spending by ₹100",
      "Defer non-essential purchases"
    ]
  }
}
```

---

## Jar System Endpoints

### Get All Jars

**GET** `/jars?userId=<userId>`

Get all jars for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "jars": [
    {
      "id": "jar-123",
      "name": "Emergency Fund",
      "targetAmount": 50000,
      "currentAmount": 25000,
      "isEssential": true,
      "priority": 1,
      "progress": 50,
      "monthlyAllocation": 5000
    }
  ]
}
```

### Create Jar

**POST** `/jars`

Create a new jar.

**Request Body:**
```json
{
  "userId": "user-123",
  "name": "Emergency Fund",
  "targetAmount": 50000,
  "isEssential": true,
  "priority": 1
}
```

**Response:**
```json
{
  "jar": {
    "id": "jar-123",
    "name": "Emergency Fund",
    "targetAmount": 50000,
    "currentAmount": 0,
    "isEssential": true,
    "priority": 1
  }
}
```

### Update Jar

**PUT** `/jars/:id`

Update jar details.

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 60000,
  "priority": 1
}
```

**Response:**
```json
{
  "jar": {
    "id": "jar-123",
    "name": "Emergency Fund",
    "targetAmount": 60000,
    "currentAmount": 25000
  }
}
```

### Delete Jar

**DELETE** `/jars/:id`

Delete a jar.

**Response:**
```json
{
  "message": "Jar deleted successfully"
}
```

---

## Goals Endpoints

### Get All Goals

**GET** `/goals?userId=<userId>`

Get all financial goals for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "goals": [
    {
      "id": "goal-123",
      "name": "Buy a Car",
      "targetAmount": 500000,
      "currentAmount": 100000,
      "targetDate": "2026-12-31",
      "category": "vehicle",
      "feasible": true,
      "monthlySavingsRequired": 15000,
      "progress": 20,
      "milestones": [
        {
          "amount": 250000,
          "date": "2026-06-30",
          "completed": false
        }
      ]
    }
  ]
}
```

### Create Goal

**POST** `/goals`

Create a new financial goal.

**Request Body:**
```json
{
  "userId": "user-123",
  "name": "Buy a Car",
  "targetAmount": 500000,
  "targetDate": "2026-12-31",
  "category": "vehicle"
}
```

**Response:**
```json
{
  "goal": {
    "id": "goal-123",
    "name": "Buy a Car",
    "targetAmount": 500000,
    "targetDate": "2026-12-31",
    "feasible": true,
    "monthlySavingsRequired": 15000
  }
}
```

### Update Goal

**PUT** `/goals/:id`

Update goal details.

**Request Body:**
```json
{
  "name": "Buy a Car",
  "targetAmount": 600000,
  "targetDate": "2027-12-31"
}
```

**Response:**
```json
{
  "goal": {
    "id": "goal-123",
    "name": "Buy a Car",
    "targetAmount": 600000,
    "targetDate": "2027-12-31"
  }
}
```

---

## Spending Analysis Endpoints

### Get Spending Patterns

**GET** `/spending/patterns?userId=<userId>`

Get spending patterns and analysis.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "patterns": {
    "byCategory": {
      "food": {
        "total": 5000,
        "frequency": "daily",
        "peakDay": "Friday",
        "trend": "increasing"
      }
    },
    "anomalies": [
      {
        "date": "2025-11-20",
        "amount": 15000,
        "category": "shopping",
        "severity": "high"
      }
    ],
    "subscriptions": [
      {
        "name": "Netflix",
        "amount": 499,
        "frequency": "monthly",
        "nextRenewal": "2025-12-15"
      }
    ]
  }
}
```

---

## Budget Endpoints

### Get Budget Categories

**GET** `/budget?userId=<userId>`

Get optimized budget categories.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "budget": {
    "needs": {
      "percentage": 50,
      "amount": 25000,
      "categories": {
        "rent": 15000,
        "food": 5000,
        "utilities": 5000
      }
    },
    "wants": {
      "percentage": 30,
      "amount": 15000,
      "categories": {
        "entertainment": 8000,
        "dining": 7000
      }
    },
    "savings": {
      "percentage": 20,
      "amount": 10000
    },
    "potentialSavings": 2000
  }
}
```

---

## Alerts Endpoints

### Get Alerts

**GET** `/alerts?userId=<userId>`

Get all alerts for a user.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "type": "rent_risk",
      "priority": "critical",
      "message": "Rent due in 3 days. Current balance may not be sufficient.",
      "createdAt": "2025-11-25T10:30:00Z",
      "read": false
    }
  ]
}
```

### Mark Alert as Read

**PUT** `/alerts/:id/read`

Mark an alert as read.

**Response:**
```json
{
  "alert": {
    "id": "alert-123",
    "read": true
  }
}
```

---

## AI Coach Endpoints

### Get Financial Insights

**GET** `/coach/insights?userId=<userId>`

Get personalized financial insights.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "insights": [
    {
      "title": "Spending Trend",
      "message": "Your spending has increased by 15% this month. Consider reviewing discretionary expenses.",
      "confidence": 0.85,
      "actionable": true
    }
  ]
}
```

### Get Financial Advice

**POST** `/coach/advice`

Get personalized financial advice.

**Request Body:**
```json
{
  "userId": "user-123",
  "query": "How can I save more money?"
}
```

**Response:**
```json
{
  "advice": {
    "response": "Focus on reducing discretionary spending. Track your daily expenses and set a daily budget limit.",
    "confidence": 0.9,
    "sources": ["spending_patterns", "budget_analysis"]
  }
}
```

---

## Asset Management Endpoints

### Get Assets

**GET** `/assets?userId=<userId>`

Get user's asset portfolio.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "assets": [
    {
      "id": "asset-123",
      "name": "HDFC Bank",
      "type": "stock",
      "quantity": 10,
      "buyPrice": 1500,
      "currentPrice": 1650,
      "value": 16500,
      "gain": 1500,
      "gainPercentage": 10
    }
  ],
  "portfolio": {
    "totalValue": 100000,
    "totalGain": 5000,
    "gainPercentage": 5
  }
}
```

### Analyze Portfolio

**POST** `/assets/analyze`

Analyze asset portfolio for optimization.

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "analysis": {
    "allocation": {
      "stocks": 40,
      "bonds": 30,
      "cash": 30
    },
    "recommendations": [
      "Increase bond allocation for stability"
    ],
    "overexposure": ["tech_stocks"]
  }
}
```

---

## Market Forecasting Endpoints

### Get Market Forecasts

**GET** `/market/forecasts?userId=<userId>`

Get market forecasts for user's assets.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "forecasts": [
    {
      "assetId": "asset-123",
      "name": "HDFC Bank",
      "forecasts": {
        "1d": {
          "low": 1640,
          "high": 1660,
          "confidence": 0.85
        },
        "7d": {
          "low": 1620,
          "high": 1700,
          "confidence": 0.75
        },
        "30d": {
          "low": 1500,
          "high": 1800,
          "confidence": 0.65
        }
      }
    }
  ]
}
```

### Get Investment Strategy

**POST** `/market/strategy`

Get personalized investment strategy.

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "strategy": {
    "recommendation": "Hold current positions",
    "rebalancing": {
      "suggested": true,
      "actions": [
        "Reduce tech stock exposure by 10%",
        "Increase bond allocation by 10%"
      ]
    },
    "riskAssessment": "moderate"
  }
}
```

---

## Voice Interaction Endpoints

### Process Voice Query

**POST** `/voice/query`

Process natural language financial query.

**Request Body:**
```json
{
  "userId": "user-123",
  "query": "How much can I spend today?"
}
```

**Response:**
```json
{
  "response": "You can safely spend ₹15,000 today based on your current balance and upcoming expenses.",
  "intent": "cashflow_query",
  "confidence": 0.95,
  "processingTime": 250
}
```

---

## Income Prediction Endpoints

### Get Income Forecast

**GET** `/income/forecast?userId=<userId>&days=30`

Get income forecast for specified period.

**Query Parameters:**
- `userId` (required): User ID
- `days` (optional): Number of days to forecast (7, 30, or 90)

**Response:**
```json
{
  "forecast": {
    "period": "30 days",
    "predictedIncome": 50000,
    "confidence": 0.85,
    "breakdown": [
      {
        "date": "2025-12-01",
        "amount": 50000,
        "source": "salary",
        "confidence": 0.95
      }
    ],
    "anomalies": []
  }
}
```

---

## SMS Parsing Endpoints

### Parse SMS Transaction

**POST** `/sms`

Parse bank/UPI SMS and extract transaction details.

**Request Body:**
```json
{
  "userId": "user-123",
  "smsText": "Your account has been debited with Rs. 500 for UPI transaction to merchant XYZ on 25-Nov-2025 at 10:30 AM"
}
```

**Response:**
```json
{
  "transaction": {
    "amount": 500,
    "type": "debit",
    "category": "shopping",
    "merchant": "XYZ",
    "date": "2025-11-25T10:30:00Z",
    "confidence": 0.95
  }
}
```

---

## Rate Limiting

API endpoints are rate limited:
- **Auth endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Webhooks

Subscribe to events:

```typescript
POST /webhooks/subscribe
{
  "event": "transaction.created",
  "url": "https://your-app.com/webhook"
}
```

Events:
- `transaction.created`
- `goal.milestone_reached`
- `alert.critical`
- `jar.target_reached`

