# 🎨 FinPilot Frontend Build Guide

**Status**: Frontend Components Ready
**Date**: November 26, 2025
**Version**: 1.0

---

## 📋 Overview

This guide covers the frontend components, hooks, and utilities created for FinPilot. All components are built with React, TypeScript, and shadcn/ui.

---

## 📁 Frontend Structure

```
lib/
├── hooks/
│   └── useFinancialData.ts - Main data fetching hook
├── components/
│   ├── DashboardCard.tsx - Reusable card component
│   └── AlertsList.tsx - Alerts display component
└── utils/
    ├── api-client.ts - Centralized API client
    └── formatters.ts - Data formatting utilities

app/
└── dashboard/
    └── page.tsx - Main dashboard page
```

---

## 🪝 Hooks

### useFinancialData

Fetches all financial data from the backend API.

**Usage**:
```typescript
import { useFinancialData } from '@/lib/hooks/useFinancialData';

export function MyComponent() {
  const { data, loading, error } = useFinancialData('user-123');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data?.income?.amount}</div>;
}
```

**Returns**:
- `data`: Financial data object with all endpoints
- `loading`: Boolean indicating loading state
- `error`: Error message if any

---

## 🧩 Components

### DashboardCard

Reusable card component for displaying financial metrics.

**Props**:
```typescript
interface DashboardCardProps {
  title: string;
  description?: string;
  value?: string | number;
  confidence?: number;
  range?: {
    lower: number;
    upper: number;
  };
  priority?: 'critical' | 'high' | 'medium' | 'low';
  actions?: Action[];
  children?: React.ReactNode;
}
```

**Usage**:
```typescript
<DashboardCard
  title="Monthly Income"
  value="₹50,000"
  confidence={92}
  priority="high"
  actions={[
    {
      label: 'View Details',
      onClick: () => console.log('clicked'),
    },
  ]}
/>
```

### AlertsList

Displays a list of alerts with priority indicators.

**Props**:
```typescript
interface AlertsListProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
}
```

**Usage**:
```typescript
<AlertsList
  alerts={data.alerts}
  onDismiss={(id) => console.log('Dismissed:', id)}
/>
```

---

## 🛠️ Utilities

### API Client

Centralized API communication layer.

**Usage**:
```typescript
import { apiClient } from '@/lib/utils/api-client';

// Get income data
const response = await apiClient.getIncome('user-123');

// Get spending data
const spending = await apiClient.getSpending('user-123', 'month');

// Parse SMS
const parsed = await apiClient.parseSMS('user-123', 'Spent ₹500 at Starbucks');
```

**Available Methods**:
- `getIncome(userId)` - Get income data
- `getIncomeForecast(userId, days)` - Get income forecast
- `getSpending(userId, period)` - Get spending data
- `parseSMS(userId, message)` - Parse SMS transaction
- `getCashflow(userId)` - Get cashflow data
- `getBudget(userId)` - Get budget data
- `getGoals(userId)` - Get goals
- `getAlerts(userId)` - Get alerts
- `getCoach(userId)` - Get coaching advice
- `processVoice(userId, audioData)` - Process voice input
- `getMarket(symbol)` - Get market data
- `getAssets(userId)` - Get assets
- `getJars(userId)` - Get jars
- `getUser(userId)` - Get user profile

### Formatters

Data formatting utilities for consistent display.

**Usage**:
```typescript
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  abbreviateNumber,
  getHealthScoreGrade,
} from '@/lib/utils/formatters';

formatCurrency(50000); // ₹50,000
formatPercentage(0.92); // 92.0%
formatDate(new Date()); // 26 Nov 2025
abbreviateNumber(1500000); // ₹1.5M
getHealthScoreGrade(85); // A
```

---

## 📱 Dashboard Page

Main dashboard page displaying all financial information.

**Features**:
- Overview tab with key metrics
- Income tab with forecasts
- Spending tab with analysis
- Goals tab with progress
- Assets tab with portfolio

**Location**: `app/dashboard/page.tsx`

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 4. Access Dashboard

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🔌 API Integration

All frontend components use the centralized API client which connects to the backend endpoints.

### Backend Endpoints Used

- `GET /api/v1/income` - Income data
- `GET /api/v1/income/forecast` - Income forecast
- `GET /api/v1/spending` - Spending analysis
- `POST /api/v1/sms` - SMS parsing
- `GET /api/v1/cashflow` - Cashflow analysis
- `GET /api/v1/budget` - Budget data
- `GET /api/v1/goals` - Goals
- `GET /api/v1/alerts` - Alerts
- `GET /api/v1/coach` - Coaching advice
- `POST /api/v1/voice` - Voice processing
- `GET /api/v1/market` - Market data
- `GET /api/v1/assets` - Assets
- `GET /api/v1/jars` - Jars
- `GET /api/v1/users` - User profile

---

## 🎨 Styling

All components use shadcn/ui and Tailwind CSS for styling.

### Available Components from shadcn/ui

- Card
- Badge
- Button
- Tabs
- Alert
- And more...

---

## 📊 Data Flow

```
User Component
    ↓
useFinancialData Hook
    ↓
API Client
    ↓
Backend API Routes
    ↓
ML Engines
    ↓
Database
```

---

## 🔄 State Management

Currently using React hooks for state management. For larger applications, consider:
- Redux
- Zustand
- Jotai
- Context API

---

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

---

## 📦 Building for Production

```bash
npm run build
npm start
```

---

## 🚨 Error Handling

All API calls include error handling:

```typescript
const { data, loading, error } = useFinancialData('user-123');

if (error) {
  // Handle error
  console.error('Failed to load data:', error);
}
```

---

## 🔐 Security

- All API calls use HTTPS in production
- User data is isolated per user ID
- No sensitive data stored in localStorage
- CORS configured for backend

---

## 📈 Performance

- Components use React.memo for optimization
- API calls are cached where appropriate
- Lazy loading for heavy components
- Code splitting for faster initial load

---

## 🎯 Next Steps

1. **Customize Components** - Modify colors, fonts, layouts
2. **Add More Pages** - Create additional pages for different features
3. **Implement Auth** - Add authentication layer
4. **Add Notifications** - Implement real-time notifications
5. **Mobile Optimization** - Ensure mobile responsiveness

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 💬 Support

For issues or questions:
1. Check the API_QUICK_REFERENCE.md
2. Review the IMPLEMENTATION_SUMMARY.md
3. Check the API_DOCUMENTATION.md

---

*Frontend components ready for integration with FinPilot backend*

**Status**: ✅ Ready for Development
**Last Updated**: November 26, 2025

---
