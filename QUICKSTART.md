# FinPilot Quick Start Guide

Get FinPilot up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- Git installed

## Step 1: Clone Repository

```bash
git clone https://github.com/UnknownDeveloper2k24/FinCoach-AI-V3.git
cd FinCoach-AI-V3
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Setup Database

### Create Database
```bash
createdb finpilot_db
```

### Configure Environment
Create `.env` file:
```
DATABASE_URL=postgresql://localhost/finpilot_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d
```

### Run Migrations
```bash
npx prisma migrate deploy
```

## Step 4: Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Step 5: Test API

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
```

### Database
```bash
npx prisma studio   # Open Prisma Studio
npx prisma migrate dev --name migration_name  # Create migration
npx prisma migrate reset  # Reset database
```

### Testing
```bash
npm test             # Run tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Generate coverage report
```

## Project Structure

```
finpilot/
├── app/api/v1/          # API routes
├── lib/                 # Utilities and helpers
├── prisma/              # Database schema
├── __tests__/           # Test files
└── docs/                # Documentation
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/verify` - Verify token

### Users
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update user profile

### Financial Management
- `GET /api/v1/cashflow` - Get cashflow analysis
- `GET /api/v1/jars` - Get all jars
- `POST /api/v1/jars` - Create jar
- `GET /api/v1/goals` - Get all goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/budget` - Get budget categories
- `GET /api/v1/spending/patterns` - Get spending patterns

### AI Agents
- `GET /api/v1/coach/insights` - Get financial insights
- `POST /api/v1/coach/advice` - Get financial advice
- `POST /api/v1/voice/query` - Process voice query
- `GET /api/v1/alerts` - Get alerts
- `GET /api/v1/assets` - Get assets
- `GET /api/v1/market/forecasts` - Get market forecasts

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d finpilot_db

# Reset database
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change port in package.json or use:
PORT=3001 npm run dev
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Read Documentation**
   - [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Connect frontend
   - [AUTHENTICATION.md](AUTHENTICATION.md) - Auth implementation
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

2. **Setup Frontend**
   - Connect UI components to API
   - Implement authentication flow
   - Add state management

3. **Run Tests**
   - `npm test` - Run unit tests
   - `npm run test:e2e` - Run E2E tests

4. **Deploy**
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options

## Support

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/UnknownDeveloper2k24/FinCoach-AI-V3/issues)
- 💬 [Discussions](https://github.com/UnknownDeveloper2k24/FinCoach-AI-V3/discussions)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Happy coding! 🚀**
