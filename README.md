# FinPilot - Premium Financial OS

FinPilot is a premium mobile-first financial OS inspired by CRED's clean aesthetics. It helps users anticipate income, manage cashflow, track assets, and plan their financial life.

## Backend Architecture

The FinPilot backend is built as a comprehensive multi-agent architecture with 13 specialized agents that handle different aspects of financial management:

### Core Agents

1. **Income Prediction Agent**
   - 7/30/90 day forecasts with confidence scoring
   - Income trend analysis
   - Anomaly detection in income patterns

2. **Cashflow Agent**
   - Daily safe-to-spend calculations
   - Runout prediction
   - Micro-actions for cashflow improvement

3. **Jar System Agent**
   - Auto-allocation of funds to jars
   - Shortfall detection
   - Daily saving suggestions

4. **UPI/BANK SMS Parsing Agent**
   - Parse SMS messages
   - Extract transaction details
   - Auto-categorize transactions

5. **Spending Pattern Agent**
   - Detect spending frequency
   - Identify peak spending days
   - Anomaly detection
   - Subscription tracking

6. **Budget Optimization Agent**
   - Category reduction recommendations
   - Potential savings identification
   - Optimized budget limits
   - 50/30/20 rule implementation

7. **Goal Planning Agent**
   - Feasibility checks
   - Monthly savings calculations
   - Milestone tracking
   - Goal progress monitoring

8. **Alert Engine**
   - Rent risk alerts
   - Overspending notifications
   - Cash runout warnings
   - Goal milestone celebrations

9. **AI Coach Agent**
   - Clean financial reasoning
   - 2-3 sentence micro-advice
   - Personalized financial insights

10. **Asset Management Agent**
    - Track stocks, mutual funds, and liquid assets
    - Real-time price updates
    - Portfolio analysis
    - Asset allocation tracking

11. **Market Forecasting Agent**
    - 1d/7d/30d price range forecasts
    - Confidence bands
    - Trend analysis
    - Volatility assessment

12. **Investment Strategy Agent**
    - Low-risk rebalancing recommendations
    - Overexposure detection
    - Portfolio optimization
    - Risk assessment

13. **Voice Interaction Agent**
    - Crisp <8-second voice output
    - Financial query processing
    - Intent recognition
    - Concise financial responses

## Technical Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful APIs under `/api/v1/` structure
- **UI**: CRED-inspired minimal, premium design
- **Authentication**: JWT-based authentication (to be implemented)

## Database Schema

The database schema includes 20+ models to support all the financial management features:

- User & Profile
- Account & Transaction
- Jar System
- Income & Forecasting
- Cashflow Analysis
- Goal Planning
- Alert System
- Asset Management
- SMS Parsing
- Spending Patterns
- Budget Optimization
- Financial Insights
- Audit Logging

## API Structure

All API routes are organized under the `/api/v1/` path with a consistent RESTful structure. See the [API Routes Index](app/api/v1/index.ts) for detailed documentation of all endpoints.

## Design Principles

FinPilot follows these design principles:

- **Minimal**: Clean, uncluttered interfaces
- **Premium**: High-quality visuals and interactions
- **Intentional**: Every element serves a purpose
- **Mobile-first**: Optimized for mobile experience
- **Silent Intelligence**: Smart features that work without being intrusive

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database: `npx prisma migrate dev`
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/finpilot_db
```

## License

This project is proprietary and confidential.
