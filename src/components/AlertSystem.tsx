
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Triangle, Info, Bell, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Alert, AlertPriority } from '@/types/equipment';

const AlertSystem: React.FC = () => {
  // Initial alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-001',
      equipmentId: 'pump-003',
      timestamp: new Date(new Date().getTime() - 12 * 60000),
      message: 'Wellhead temperature exceeding normal range',
      parameter: 'temperature',
      value: 78.2,
      threshold: 75.0,
      priority: 'medium',
      isAcknowledged: false
    },
    {
      id: 'alert-002',
      equipmentId: 'comp-002',
      timestamp: new Date(new Date().getTime() - 43 * 60000),
      message: 'Corrosion rate increasing in section P-12',
      parameter: 'corrosion',
      value: 0.23,
      threshold: 0.18,
      priority: 'medium',
      isAcknowledged: false
    },
    {
      id: 'alert-003',
      equipmentId: 'safety-system',
      timestamp: new Date(new Date().getTime() - 72 * 60000),
      message: 'PPE compliance at 89% - below 90% target',
      parameter: 'compliance',
      value: 89,
      threshold: 90,
      priority: 'low',
      isAcknowledged: false
    },
    {
      id: 'alert-004',
      equipmentId: 'pump-001',
      timestamp: new Date(new Date().getTime() - 150 * 60000),
      message: 'Next maintenance cycle scheduled',
      parameter: 'maintenance',
      value: 7,
      threshold: 14,
      priority: 'low',
      isAcknowledged: false,
      correlatedAlerts: ['alert-005']
    },
    {
      id: 'alert-005',
      equipmentId: 'pump-001',
      timestamp: new Date(new Date().getTime() - 165 * 60000),
      message: 'Bearing vibration trending upward',
      parameter: 'vibration',
      value: 0.92,
      threshold: 1.2,
      priority: 'low',
      isAcknowledged: false,
      correlatedAlerts: ['alert-004']
    }
  ]);

  // Filter states
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Simulate new alerts occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance of a new alert
      if (Math.random() < 0.1) {
        const newAlert: Alert = generateRandomAlert();
        
        // Aggregate similar alerts if they exist
        const similarAlerts = alerts.filter(
          a => a.equipmentId === newAlert.equipmentId && 
               a.parameter === newAlert.parameter &&
               !a.isAcknowledged &&
               new Date().getTime() - a.timestamp.getTime() < 30 * 60000
        );
        
        if (similarAlerts.length > 0) {
          // Update existing alert instead of creating new one
          const updatedAlerts = alerts.map(alert => {
            if (alert.id === similarAlerts[0].id) {
              // Increase priority if threshold exceeded further
              const newPriority: AlertPriority = 
                newAlert.value > alert.threshold * 1.2 ? 'high' :
                newAlert.value > alert.threshold * 1.1 ? 'medium' : 'low';
              
              return {
                ...alert,
                value: newAlert.value,
                priority: newPriority as AlertPriority,
                timestamp: new Date(),
                message: `${alert.message} (Updated)`
              };
            }
            return alert;
          });
          
          setAlerts(updatedAlerts);
        } else {
          // Add new alert
          setAlerts(prev => [newAlert, ...prev].slice(0, 8)); // Keep max 8 alerts
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [alerts]);

  // Generate a random alert for simulation
  const generateRandomAlert = (): Alert => {
    const equipmentIds = ['pump-001', 'pump-003', 'comp-002', 'safety-system'];
    const parameters = [
      { name: 'pressure', threshold: 1800, unit: 'PSI' },
      { name: 'temperature', threshold: 75, unit: '°C' },
      { name: 'vibration', threshold: 1.2, unit: 'mm/s' },
      { name: 'corrosion', threshold: 0.18, unit: 'mm/yr' }
    ];
    
    const randomEquipment = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
    const randomParameter = parameters[Math.floor(Math.random() * parameters.length)];
    
    // Generate a value that exceeds the threshold
    const exceedFactor = 1 + Math.random() * 0.3; // Up to 30% over threshold
    const value = randomParameter.threshold * exceedFactor;
    
    // Determine priority based on how much the threshold is exceeded
    let priority: AlertPriority;
    if (exceedFactor > 1.2) priority = 'high';
    else if (exceedFactor > 1.1) priority = 'medium';
    else priority = 'low';
    
    const messages = {
      pressure: `Elevated pressure detected in ${randomEquipment}`,
      temperature: `High temperature alert for ${randomEquipment}`,
      vibration: `Abnormal vibration levels in ${randomEquipment}`,
      corrosion: `Accelerated corrosion detected in ${randomEquipment}`
    };
    
    return {
      id: `alert-${Date.now()}`,
      equipmentId: randomEquipment,
      timestamp: new Date(),
      message: messages[randomParameter.name as keyof typeof messages],
      parameter: randomParameter.name,
      value: value,
      threshold: randomParameter.threshold,
      priority: priority,
      isAcknowledged: false
    };
  };

  // Acknowledge an alert
  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isAcknowledged: true } : alert
      )
    );
  };

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => 
    (filterPriority === 'all' || alert.priority === filterPriority) &&
    (showAcknowledged || !alert.isAcknowledged)
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getAlertIcon = (alert: Alert) => {
    switch (alert.priority) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-vigia-danger" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-vigia-danger" />;
      case 'medium':
        return <Bell className="h-5 w-5 text-vigia-warning" />;
      default:
        return <Info className="h-5 w-5 text-vigia-blue" />;
    }
  };

  const getAlertClass = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-vigia-danger';
      case 'high':
        return 'border-l-vigia-danger';
      case 'medium':
        return 'border-l-vigia-warning';
      default:
        return 'border-l-vigia-blue';
    }
  };

  const getTimeString = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
  };

  return (
    <Card className="bg-vigia-card border-border h-full overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-vigia-teal" />
          <h2 className="font-medium">Active Alerts</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-vigia-blue/20 text-vigia-blue py-1 px-2 rounded-full">
            {filteredAlerts.filter(a => !a.isAcknowledged).length} Active
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
          >
            {showAcknowledged ? 'Hide Ack.' : 'Show All'}
          </Button>
        </div>
      </div>
      
      <div className="p-2 border-b border-border flex flex-wrap gap-1">
        <Badge 
          variant={filterPriority === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilterPriority('all')}
        >
          All
        </Badge>
        <Badge 
          variant={filterPriority === 'high' ? 'default' : 'outline'}
          className="cursor-pointer bg-vigia-danger/20 text-vigia-danger border-vigia-danger/30 hover:bg-vigia-danger/30"
          onClick={() => setFilterPriority('high')}
        >
          High
        </Badge>
        <Badge 
          variant={filterPriority === 'medium' ? 'default' : 'outline'}
          className="cursor-pointer bg-vigia-warning/20 text-vigia-warning border-vigia-warning/30 hover:bg-vigia-warning/30"
          onClick={() => setFilterPriority('medium')}
        >
          Medium
        </Badge>
        <Badge 
          variant={filterPriority === 'low' ? 'default' : 'outline'}
          className="cursor-pointer bg-vigia-blue/20 text-vigia-blue border-vigia-blue/30 hover:bg-vigia-blue/30"
          onClick={() => setFilterPriority('low')}
        >
          Low
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No active alerts
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 border-l-4 ${getAlertClass(alert.priority)} ${
                  alert.isAcknowledged ? 'bg-muted/20' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert)}
                  <div className="flex-1">
                    <div className="font-medium flex justify-between items-start">
                      <span>{alert.message}</span>
                      {!alert.isAcknowledged && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Ack
                        </Button>
                      )}
                    </div>
                    <div className="mt-1 text-xs flex flex-wrap justify-between gap-2">
                      <div className="space-x-2">
                        <span className="text-muted-foreground">{alert.equipmentId}</span>
                        <span className="text-vigia-teal">{alert.parameter}: {alert.value.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">{getTimeString(alert.timestamp)}</span>
                    </div>
                    
                    {/* Show correlated alerts if any */}
                    {alert.correlatedAlerts && alert.correlatedAlerts.length > 0 && (
                      <div className="mt-2 text-xs bg-muted/30 p-1 rounded">
                        <span className="text-muted-foreground">Related to: </span>
                        {alerts
                          .filter(a => alert.correlatedAlerts?.includes(a.id))
                          .map(a => a.message)
                          .join(', ')}
                      </div>
                    )}
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
