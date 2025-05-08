
import React from 'react';
import { Card } from '@/components/ui/card';
import { Triangle, Info, Bell } from 'lucide-react';

interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  time: string;
}

const AlertSystem: React.FC = () => {
  // Sample alerts
  const alerts: Alert[] = [
    {
      id: 1,
      level: 'warning',
      message: 'Wellhead temperature exceeding normal range',
      source: 'Sensor TMP-3421',
      time: '12 min ago'
    },
    {
      id: 2,
      level: 'warning',
      message: 'Corrosion rate increasing in section P-12',
      source: 'Predictive Analysis',
      time: '43 min ago'
    },
    {
      id: 3,
      level: 'info',
      message: 'PPE compliance at 89% - below 90% target',
      source: 'Vision AI System',
      time: '1h 12m ago'
    },
    {
      id: 4,
      level: 'info',
      message: 'Next maintenance cycle scheduled',
      source: 'Maintenance System',
      time: '2h 30m ago'
    }
  ];

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <Triangle className="h-5 w-5 text-vigia-danger" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-vigia-warning" />;
      default:
        return <Info className="h-5 w-5 text-vigia-blue" />;
    }
  };

  const getAlertClass = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-l-vigia-danger';
      case 'warning':
        return 'border-l-vigia-warning';
      default:
        return 'border-l-vigia-blue';
    }
  };

  return (
    <Card className="bg-vigia-card border-border h-full overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-vigia-teal" />
          <h2 className="font-medium">Active Alerts</h2>
        </div>
        <div className="text-xs bg-vigia-blue/20 text-vigia-blue py-1 px-2 rounded-full">
          {alerts.length} Alerts
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No active alerts
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 border-l-4 ${getAlertClass(alert.level)}`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{alert.source}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AlertSystem;
