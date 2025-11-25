-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "riskTolerance" TEXT NOT NULL DEFAULT 'moderate',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Calcutta',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "voiceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastSMSParsed" TIMESTAMP(3),
    "smsPhoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "description" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "parsedFromSMS" BOOLEAN NOT NULL DEFAULT false,
    "smsRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "allocationPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isEssential" BOOLEAN NOT NULL DEFAULT false,
    "autoAllocate" BOOLEAN NOT NULL DEFAULT true,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JarAllocation" (
    "id" TEXT NOT NULL,
    "jarId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "allocationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JarAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "source" TEXT NOT NULL,
    "incomeDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "nextExpectedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeForecast" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forecast7Day" DECIMAL(12,2) NOT NULL,
    "forecast30Day" DECIMAL(12,2) NOT NULL,
    "forecast90Day" DECIMAL(12,2) NOT NULL,
    "confidence7Day" INTEGER NOT NULL DEFAULT 0,
    "confidence30Day" INTEGER NOT NULL DEFAULT 0,
    "confidence90Day" INTEGER NOT NULL DEFAULT 0,
    "lower7Day" DECIMAL(12,2) NOT NULL,
    "upper7Day" DECIMAL(12,2) NOT NULL,
    "lower30Day" DECIMAL(12,2) NOT NULL,
    "upper30Day" DECIMAL(12,2) NOT NULL,
    "lower90Day" DECIMAL(12,2) NOT NULL,
    "upper90Day" DECIMAL(12,2) NOT NULL,
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "incomeDips" BOOLEAN NOT NULL DEFAULT false,
    "trendShifts" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashflowAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "safeToSpendToday" DECIMAL(12,2) NOT NULL,
    "dailyBurnRate" DECIMAL(12,2) NOT NULL,
    "runoutDays" INTEGER NOT NULL,
    "runoutDate" TIMESTAMP(3),
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashflowAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isFeasible" BOOLEAN NOT NULL DEFAULT true,
    "monthlySavingsNeeded" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "symbol" TEXT,
    "quantity" DECIMAL(18,8) NOT NULL,
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "currentPrice" DECIMAL(12,2) NOT NULL,
    "totalValue" DECIMAL(12,2) NOT NULL,
    "gainLoss" DECIMAL(12,2) NOT NULL,
    "gainLossPercent" DECIMAL(5,2) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "lastPriceUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "averageCost" DECIMAL(12,2) NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "dayChange" DECIMAL(12,2) NOT NULL,
    "dayChangePercent" DECIMAL(5,2) NOT NULL,
    "weekChange" DECIMAL(12,2) NOT NULL,
    "monthChange" DECIMAL(12,2) NOT NULL,
    "allocationPercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioForecast" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forecast1Day" DECIMAL(12,2) NOT NULL,
    "forecast7Day" DECIMAL(12,2) NOT NULL,
    "forecast30Day" DECIMAL(12,2) NOT NULL,
    "confidence1Day" INTEGER NOT NULL DEFAULT 0,
    "confidence7Day" INTEGER NOT NULL DEFAULT 0,
    "confidence30Day" INTEGER NOT NULL DEFAULT 0,
    "lower1Day" DECIMAL(12,2) NOT NULL,
    "upper1Day" DECIMAL(12,2) NOT NULL,
    "lower7Day" DECIMAL(12,2) NOT NULL,
    "upper7Day" DECIMAL(12,2) NOT NULL,
    "lower30Day" DECIMAL(12,2) NOT NULL,
    "upper30Day" DECIMAL(12,2) NOT NULL,
    "volatilitySpike" BOOLEAN NOT NULL DEFAULT false,
    "riskZones" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "smsText" TEXT NOT NULL,
    "sender" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "merchant" TEXT,
    "transactionType" TEXT,
    "category" TEXT,
    "isParsed" BOOLEAN NOT NULL DEFAULT false,
    "parseConfidence" INTEGER NOT NULL DEFAULT 0,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SMSRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendingPattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "averageAmount" DECIMAL(12,2) NOT NULL,
    "peakDay" TEXT,
    "peakDayAmount" DECIMAL(12,2) NOT NULL,
    "hasAnomalies" BOOLEAN NOT NULL DEFAULT false,
    "anomalyDescription" TEXT,
    "isRecurringSubscription" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionName" TEXT,
    "subscriptionCost" DECIMAL(12,2) NOT NULL,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendingPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthlyLimit" DECIMAL(12,2) NOT NULL,
    "currentSpent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "suggestedLimit" DECIMAL(12,2) NOT NULL,
    "potentialSavings" DECIMAL(12,2) NOT NULL,
    "optimizedDailyLimit" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "suggestedActions" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isActioned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_accountType_idx" ON "Account"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_smsRecordId_key" ON "Transaction"("smsRecordId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- CreateIndex
CREATE INDEX "Transaction_transactionDate_idx" ON "Transaction"("transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Jar_userId_idx" ON "Jar"("userId");

-- CreateIndex
CREATE INDEX "Jar_priority_idx" ON "Jar"("priority");

-- CreateIndex
CREATE INDEX "JarAllocation_jarId_idx" ON "JarAllocation"("jarId");

-- CreateIndex
CREATE INDEX "JarAllocation_allocationDate_idx" ON "JarAllocation"("allocationDate");

-- CreateIndex
CREATE INDEX "IncomeRecord_userId_idx" ON "IncomeRecord"("userId");

-- CreateIndex
CREATE INDEX "IncomeRecord_incomeDate_idx" ON "IncomeRecord"("incomeDate");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeForecast_userId_key" ON "IncomeForecast"("userId");

-- CreateIndex
CREATE INDEX "IncomeForecast_userId_idx" ON "IncomeForecast"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CashflowAnalysis_userId_key" ON "CashflowAnalysis"("userId");

-- CreateIndex
CREATE INDEX "CashflowAnalysis_userId_idx" ON "CashflowAnalysis"("userId");

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");

-- CreateIndex
CREATE INDEX "Milestone_goalId_idx" ON "Milestone"("goalId");

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_isRead_idx" ON "Alert"("isRead");

-- CreateIndex
CREATE INDEX "AlertRule_userId_idx" ON "AlertRule"("userId");

-- CreateIndex
CREATE INDEX "AlertRule_type_idx" ON "AlertRule"("type");

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "PortfolioHolding_userId_idx" ON "PortfolioHolding"("userId");

-- CreateIndex
CREATE INDEX "PortfolioHolding_assetId_idx" ON "PortfolioHolding"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioForecast_userId_key" ON "PortfolioForecast"("userId");

-- CreateIndex
CREATE INDEX "PortfolioForecast_userId_idx" ON "PortfolioForecast"("userId");

-- CreateIndex
CREATE INDEX "SMSRecord_userId_idx" ON "SMSRecord"("userId");

-- CreateIndex
CREATE INDEX "SMSRecord_accountId_idx" ON "SMSRecord"("accountId");

-- CreateIndex
CREATE INDEX "SMSRecord_isParsed_idx" ON "SMSRecord"("isParsed");

-- CreateIndex
CREATE INDEX "SpendingPattern_userId_idx" ON "SpendingPattern"("userId");

-- CreateIndex
CREATE INDEX "SpendingPattern_category_idx" ON "SpendingPattern"("category");

-- CreateIndex
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");

-- CreateIndex
CREATE INDEX "Budget_category_idx" ON "Budget"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_category_month_year_key" ON "Budget"("userId", "category", "month", "year");

-- CreateIndex
CREATE INDEX "FinancialInsight_userId_idx" ON "FinancialInsight"("userId");

-- CreateIndex
CREATE INDEX "FinancialInsight_type_idx" ON "FinancialInsight"("type");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_smsRecordId_fkey" FOREIGN KEY ("smsRecordId") REFERENCES "SMSRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jar" ADD CONSTRAINT "Jar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JarAllocation" ADD CONSTRAINT "JarAllocation_jarId_fkey" FOREIGN KEY ("jarId") REFERENCES "Jar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeRecord" ADD CONSTRAINT "IncomeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSRecord" ADD CONSTRAINT "SMSRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSRecord" ADD CONSTRAINT "SMSRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingPattern" ADD CONSTRAINT "SpendingPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
