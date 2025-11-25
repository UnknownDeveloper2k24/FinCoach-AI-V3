/**
 * FinPilot API Routes Index
 * 
 * This file serves as documentation for all API routes in the FinPilot backend.
 * The backend is structured as a multi-agent architecture with 13 specialized agents
 * that handle different aspects of financial management.
 */

/**
 * 1. User Management API
 * Route: /api/v1/users
 * 
 * Handles user registration, authentication, profile management, and preferences.
 * 
 * Endpoints:
 * - GET /api/v1/users - Get all users
 * - GET /api/v1/users/:id - Get user by ID
 * - POST /api/v1/users - Create a new user
 * - PUT /api/v1/users/:id - Update a user
 * - DELETE /api/v1/users/:id - Delete a user
 */

/**
 * 2. Income Prediction Agent
 * Route: /api/v1/income
 * 
 * Handles income tracking, prediction, and forecasting with confidence scoring.
 * 
 * Endpoints:
 * - GET /api/v1/income - Get income records for a user
 * - POST /api/v1/income - Create a new income record
 * - GET /api/v1/income/forecast - Get income forecasts (7/30/90 days)
 * - POST /api/v1/income/forecast - Generate income forecasts
 */

/**
 * 3. Cashflow Agent
 * Route: /api/v1/cashflow
 * 
 * Handles daily safe-to-spend calculations, runout prediction, and micro-actions.
 * 
 * Endpoints:
 * - GET /api/v1/cashflow - Get cashflow analysis for a user
 * - POST /api/v1/cashflow/analyze - Generate cashflow analysis
 * - GET /api/v1/cashflow/actions - Get recommended micro-actions
 */

/**
 * 4. Jar System Agent
 * Route: /api/v1/jars
 * 
 * Handles jar-based money allocation, shortfall detection, and saving suggestions.
 * 
 * Endpoints:
 * - GET /api/v1/jars - Get all jars for a user
 * - POST /api/v1/jars - Create a new jar
 * - PUT /api/v1/jars/:id - Update a jar
 * - DELETE /api/v1/jars/:id - Delete a jar
 * - POST /api/v1/jars/allocate - Auto-allocate funds to jars
 * - GET /api/v1/jars/suggestions - Get daily saving suggestions
 */

/**
 * 5. UPI/BANK SMS Parsing Agent
 * Route: /api/v1/sms
 * 
 * Handles parsing of SMS messages, extraction of transaction details, and auto-categorization.
 * 
 * Endpoints:
 * - POST /api/v1/sms/parse - Parse SMS message
 * - GET /api/v1/sms/transactions - Get transactions from parsed SMS
 */

/**
 * 6. Spending Pattern Agent
 * Route: /api/v1/spending
 * 
 * Handles detection of spending frequency, peak days, anomalies, and subscriptions.
 * 
 * Endpoints:
 * - GET /api/v1/spending/patterns - Get spending patterns for a user
 * - POST /api/v1/spending/analyze - Analyze spending patterns
 * - GET /api/v1/spending/anomalies - Get spending anomalies
 * - GET /api/v1/spending/subscriptions - Get detected subscriptions
 */

/**
 * 7. Budget Optimization Agent
 * Route: /api/v1/budget
 * 
 * Handles category reduction, potential savings, and optimized limits.
 * 
 * Endpoints:
 * - GET /api/v1/budget - Get budget categories for a user
 * - POST /api/v1/budget - Create a new budget category
 * - PUT /api/v1/budget/:id - Update a budget category
 * - DELETE /api/v1/budget/:id - Delete a budget category
 * - POST /api/v1/budget/optimize - Optimize budget limits
 * - GET /api/v1/budget/savings - Get potential savings
 */

/**
 * 8. Goal Planning Agent
 * Route: /api/v1/goals
 * 
 * Handles feasibility checks, monthly savings calculations, and milestone tracking.
 * 
 * Endpoints:
 * - GET /api/v1/goals - Get all goals for a user
 * - POST /api/v1/goals - Create a new goal
 * - PUT /api/v1/goals/:id - Update a goal
 * - DELETE /api/v1/goals/:id - Delete a goal
 * - POST /api/v1/goals/check - Check goal feasibility
 * - GET /api/v1/goals/milestones - Get goal milestones
 */

/**
 * 9. Alert Engine
 * Route: /api/v1/alerts
 * 
 * Handles rent risk, overspending, cash runout, and goal milestone alerts.
 * 
 * Endpoints:
 * - GET /api/v1/alerts - Get alerts for a user
 * - POST /api/v1/alerts/generate - Generate alerts
 * - PUT /api/v1/alerts/:id/read - Mark alert as read
 */

/**
 * 10. AI Coach Agent
 * Route: /api/v1/coach
 * 
 * Handles clean financial reasoning and micro-advice generation.
 * 
 * Endpoints:
 * - GET /api/v1/coach/insights - Get financial insights for a user
 * - POST /api/v1/coach/insights - Generate financial insights
 * - POST /api/v1/coach/advice - Get personalized financial advice
 */

/**
 * 11. Asset Management Agent
 * Route: /api/v1/assets
 * 
 * Handles tracking of stocks, mutual funds, liquid assets, and real-time prices.
 * 
 * Endpoints:
 * - GET /api/v1/assets - Get all assets for a user
 * - POST /api/v1/assets - Create a new asset
 * - POST /api/v1/assets/update-prices - Update asset prices
 * - POST /api/v1/assets/analyze - Analyze portfolio
 */

/**
 * 12. Market Forecasting Agent
 * Route: /api/v1/market
 * 
 * Handles 1d/7d/30d price range forecasts with confidence bands.
 * 
 * Endpoints:
 * - GET /api/v1/market/forecasts - Get market forecasts for a user's assets
 * - POST /api/v1/market/generate - Generate market forecasts
 * - POST /api/v1/market/strategy - Get investment strategy recommendations
 */

/**
 * 13. Voice Interaction Agent
 * Route: /api/v1/voice
 * 
 * Handles crisp voice output generation for financial queries.
 * 
 * Endpoints:
 * - POST /api/v1/voice/query - Process voice query
 */

export {};
