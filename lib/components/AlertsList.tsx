import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertsListProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
}

const priorityIcons = {
  critical: <AlertCircle className="h-4 w-4 text-red-600" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  medium: <Info className="h-4 w-4 text-yellow-600" />,
  low: <CheckCircle className="h-4 w-4 text-green-600" />,
};

const priorityClasses = {
  critical: 'border-red-200 bg-red-50',
  high: 'border-orange-200 bg-orange-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-green-200 bg-green-50',
};

export function AlertsList({ alerts, onDismiss }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No alerts at this time
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} className={priorityClasses[alert.priority]}>
          <div className="flex items-start gap-3">
            {priorityIcons[alert.priority]}
            <div className="flex-1">
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{alert.timestamp}</span>
                {alert.action && (
                  <button
                    onClick={alert.action.onClick}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {alert.action.label}
                  </button>
                )}
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}
