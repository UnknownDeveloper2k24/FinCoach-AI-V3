# FinPilot API Quick Reference

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require `userId` parameter (query or body)

---

## 📊 Income Management

### GET /income
Get all income records and forecasts
```bash
curl "http://localhost:3000/api/v1/income?userId=USER_ID"
```
**Response**: Income records, patterns, 7/30/90d forecasts, alerts

### POST /income
Create new income record
```bash
curl -X POST http://localhost:3000/api/v1/income \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "amount": 50000,
    "source": "Salary",
    "incomeDate": "2025-11-26",
    "isRecurring": true,
    "frequency": "monthly"
  }'
```

### GET /income/forecast
Get income forecast for specific period
```bash
curl "http://localhost:3000/api/v1/income/forecast?userId=USER_ID&days=30"
```
**Response**: Predicted income, confidence range, patterns, alerts

---

## 💰 Spending Analysis

### GET /spending
Analyze spending patterns
```bash
curl "http://localhost:3000/api/v1/spending?userId=USER_ID&days=30"
```
**Response**: Patterns, anomalies, subscriptions, peak days, category breakdown

### POST /sms
Parse SMS and create transaction
```bash
curl -X POST http://localhost:3000/api/v1/sms \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "smsText": "Debit card XXXX1234 debited by Rs.500 at Starbucks on 26-Nov-25"
  }'
```
**Response**: Parsed transaction, merchant, category, confidence

### GET /sms
Get parsed transactions
```bash
curl "http://localhost:3000/api/v1/sms?userId=USER_ID"
```

---

## 💳 Cashflow Management

### GET /cashflow
Analyze cashflow and runway
```bash
curl "http://localhost:3000/api/v1/cashflow?userId=USER_ID"
```
**Response**: Current balance, safe-to-spend, burn rate, runway days, micro-actions

---

## 💡 Budget Optimization

### GET /budget
Get budget optimization recommendations
```bash
curl "http://localhost:3000/api/v1/budget?userId=USER_ID"
```
**Response**: 50/30/20 breakdown, category recommendations, potential savings

---

## 🎯 Goals

### GET /goals
Get all goals with feasibility analysis
```bash
curl "http://localhost:3000/api/v1/goals?userId=USER_ID"
```
**Response**: Goals, feasibility, milestones, risk factors, recommendations

### POST /goals
Create new goal
```bash
curl -X POST http://localhost:3000/api/v1/goals \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "name": "Emergency Fund",
    "category": "savings",
    "targetAmount": 100000,
    "deadline": "2026-12-31",
    "priority": 1
  }'
```

---

## 🚨 Alerts

### GET /alerts
Get all alerts for user
```bash
curl "http://localhost:3000/api/v1/alerts?userId=USER_ID"
```
**Response**: Alerts by priority (critical/high/medium/low), summary

---

## 🤖 AI Coach

### GET /coach
Get personalized financial advice
```bash
curl "http://localhost:3000/api/v1/coach?userId=USER_ID"
```
**Response**: Advice, tips, health score, action plan (immediate/short-term/long-term)

---

## 🎤 Voice

### POST /voice
Process voice query
```bash
curl -X POST http://localhost:3000/api/v1/voice \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "query": "How much can I spend today?"
  }'
```
**Response**: Intent, response, actions, confidence

---

## 📈 Market

### GET /market
Get market forecasts
```bash
curl "http://localhost:3000/api/v1/market?userId=USER_ID&symbol=NIFTY50"
```
**Response**: Forecast, technical analysis, signals, trend

---

## 🏺 Jars (Savings Buckets)

### GET /jars
Get all jars with allocation recommendations
```bash
curl "http://localhost:3000/api/v1/jars?userId=USER_ID"
```
**Response**: Jars, allocation recommendations, shortfalls, daily savings

### POST /jars
Create new jar
```bash
curl -X POST http://localhost:3000/api/v1/jars \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "name": "Vacation Fund",
    "targetAmount": 50000,
    "category": "travel",
    "priority": 3
  }'
```

### GET /jars/[id]
Get specific jar
```bash
curl "http://localhost:3000/api/v1/jars/JAR_ID"
```

### PUT /jars/[id]
Update jar
```bash
curl -X PUT http://localhost:3000/api/v1/jars/JAR_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "currentAmount": 25000
  }'
```

### DELETE /jars/[id]
Delete jar
```bash
curl -X DELETE http://localhost:3000/api/v1/jars/JAR_ID
```

---

## 💎 Assets

### GET /assets
Get portfolio analysis
```bash
curl "http://localhost:3000/api/v1/assets?userId=USER_ID"
```
**Response**: Portfolio value, performance, risk, rebalancing advice, diversification

### POST /assets
Add new asset
```bash
curl -X POST http://localhost:3000/api/v1/assets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "name": "HDFC Bank",
    "type": "stock",
    "quantity": 10,
    "purchasePrice": 1500,
    "currentPrice": 1650,
    "purchaseDate": "2025-01-15"
  }'
```

---

## 👤 Users

### GET /users
Get all users (admin)
```bash
curl "http://localhost:3000/api/v1/users"
```

### POST /users
Create new user
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {}
  }'
```

### GET /users/[id]
Get user profile with health score
```bash
curl "http://localhost:3000/api/v1/users/USER_ID"
```
**Response**: User profile, financial health, financials, recommendations, stats

### PUT /users/[id]
Update user profile
```bash
curl -X PUT http://localhost:3000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "preferences": { "theme": "dark" }
  }'
```

### DELETE /users/[id]
Delete or anonymize user
```bash
curl -X DELETE http://localhost:3000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{ "anonymize": true }'
```

---

## Response Format

All successful responses follow this format:
```json
{
  "data": { /* endpoint-specific data */ },
  "status": 200
}
```

Error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## ML Engine Confidence Levels

All predictions include confidence scoring:
- **90-100%**: Very High - Act on this
- **75-89%**: High - Good signal
- **60-74%**: Medium - Consider with caution
- **<60%**: Low - Insufficient data

---

**Last Updated**: November 26, 2025
**Version**: 1.0
