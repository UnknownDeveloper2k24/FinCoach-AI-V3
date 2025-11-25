import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

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

const priorityColors = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export function DashboardCard({
  title,
  description,
  value,
  confidence,
  range,
  priority,
  actions,
  children,
}: DashboardCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {priority && (
            <Badge className={priorityColors[priority]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {value !== undefined && (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{value}</div>
            {confidence !== undefined && (
              <div className="text-sm text-gray-600">
                Confidence: {confidence}%
              </div>
            )}
            {range && (
              <div className="text-sm text-gray-600">
                Range: ₹{range.lower.toLocaleString()} - ₹{range.upper.toLocaleString()}
              </div>
            )}
          </div>
        )}
        {children}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 pt-4">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size="sm"
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
