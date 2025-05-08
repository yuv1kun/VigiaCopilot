
import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Bell, Clock, CheckCircle, X, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Alerts: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Safety Alerts</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alert Settings
              </Button>
            </div>
          </div>
          
          <Card className="p-4 bg-vigia-card border-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-vigia-warning" />
                <h2 className="text-lg font-medium">Active Alerts</h2>
              </div>
              <span className="text-xs bg-vigia-warning/20 text-vigia-warning py-1 px-2 rounded-full">
                3 Active
              </span>
            </div>
            
            <div className="space-y-4">
              <AlertItem
                title="Abnormal Wellhead Temperature"
                description="Temperature has increased by 12% in the last hour"
                time="10 minutes ago"
                level="critical"
                type="system"
              />
              <AlertItem
                title="PPE Compliance Warning"
                description="Safety vest compliance below threshold (82%)"
                time="35 minutes ago"
                level="warning"
                type="compliance"
              />
              <AlertItem
                title="Pipe Corrosion Rate Above Threshold"
                description="Corrosion rate at 0.23 mm/yr - above 0.2 mm/yr threshold"
                time="1 hour ago"
                level="warning"
                type="maintenance"
              />
            </div>
          </Card>
          
          <Card className="p-4 bg-vigia-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-vigia-success" />
                <h2 className="text-lg font-medium">Resolved Alerts</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              <AlertItem
                title="Gas Detection Anomaly"
                description="Temporary spike in gas levels - returned to normal"
                time="Yesterday, 14:22"
                level="resolved"
                type="system"
              />
              <AlertItem
                title="BOP Pressure Fluctuation"
                description="Minor pressure fluctuation outside normal range"
                time="Yesterday, 09:45"
                level="resolved"
                type="system"
              />
            </div>
          </Card>
        </div>
      </main>
      <footer className="py-4 px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Vigía Safety Copilot v1.0.0 | Offshore Oil Rig Monitoring System</p>
        </div>
      </footer>
    </div>
  );
};

interface AlertItemProps {
  title: string;
  description: string;
  time: string;
  level: 'critical' | 'warning' | 'info' | 'resolved';
  type: 'system' | 'maintenance' | 'compliance';
}

const AlertItem: React.FC<AlertItemProps> = ({ title, description, time, level, type }) => {
  const getLevelIcon = () => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-vigia-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-vigia-success" />;
    }
  };
  
  const getTypeLabel = () => {
    switch (type) {
      case 'system':
        return 'System Alert';
      case 'maintenance':
        return 'Maintenance';
      case 'compliance':
        return 'Compliance';
    }
  };
  
  const getLevelStyles = () => {
    switch (level) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-500/5';
      case 'warning':
        return 'border-l-4 border-l-vigia-warning bg-vigia-warning/5';
      case 'info':
        return 'border-l-4 border-l-blue-500 bg-blue-500/5';
      case 'resolved':
        return 'border-l-4 border-l-vigia-success bg-vigia-success/5';
    }
  };

  return (
    <div className={`p-3 rounded-md ${getLevelStyles()}`}>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {getLevelIcon()}
          <h3 className="font-medium">{title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1 ml-7">{description}</p>
      <div className="flex items-center justify-between mt-2 ml-7">
        <span className="text-xs bg-vigia-muted/20 text-muted-foreground py-0.5 px-2 rounded-full">
          {getTypeLabel()}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
