import { useState, useEffect } from 'react';

interface FinancialData {
  income: any;
  spending: any;
  cashflow: any;
  budget: any;
  goals: any;
  alerts: any;
  coach: any;
  assets: any;
  jars: any;
}

export function useFinancialData(userId: string) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          incomeRes,
          spendingRes,
          cashflowRes,
          budgetRes,
          goalsRes,
          alertsRes,
          coachRes,
          assetsRes,
          jarsRes,
        ] = await Promise.all([
          fetch(`/api/v1/income?userId=${userId}`),
          fetch(`/api/v1/spending?userId=${userId}`),
          fetch(`/api/v1/cashflow?userId=${userId}`),
          fetch(`/api/v1/budget?userId=${userId}`),
          fetch(`/api/v1/goals?userId=${userId}`),
          fetch(`/api/v1/alerts?userId=${userId}`),
          fetch(`/api/v1/coach?userId=${userId}`),
          fetch(`/api/v1/assets?userId=${userId}`),
          fetch(`/api/v1/jars?userId=${userId}`),
        ]);

        const [
          income,
          spending,
          cashflow,
          budget,
          goals,
          alerts,
          coach,
          assets,
          jars,
        ] = await Promise.all([
          incomeRes.json(),
          spendingRes.json(),
          cashflowRes.json(),
          budgetRes.json(),
          goalsRes.json(),
          alertsRes.json(),
          coachRes.json(),
          assetsRes.json(),
          jarsRes.json(),
        ]);

        setData({
          income,
          spending,
          cashflow,
          budget,
          goals,
          alerts,
          coach,
          assets,
          jars,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { data, loading, error };
}
