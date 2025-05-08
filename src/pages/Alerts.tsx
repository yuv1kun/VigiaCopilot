import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Bell, Clock, CheckCircle, X, Info, AlertCircle, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePPECompliance } from '@/hooks/usePPECompliance';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { determineComplianceStatus } from '@/utils/ppeComplianceUtils';
import { Alert, AlertPriority } from '@/types/equipment';
import { generateAlert } from '@/utils/monitoringUtils';
import { useToast } from '@/hooks/use-toast';

const Alerts: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(true);
  const { toast } = useToast();
  
  // Get real-time monitoring data
  const monitoring = useRealTimeMonitoring(1000);
  
  // Get PPE compliance data
  const { ppeComplianceData, complianceStatus } = usePPECompliance(isSimulating);
  
  // State to store generated alerts
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);

  // Load alerts from localStorage
  useEffect(() => {
    const storedAlerts = localStorage.getItem('vigia-alerts');
    if (storedAlerts) {
      const allAlerts = JSON.parse(storedAlerts);
      setActiveAlerts(allAlerts.filter((alert: Alert) => !alert.isAcknowledged));
      setResolvedAlerts(allAlerts.filter((alert: Alert) => alert.isAcknowledged).slice(0, 5));
    } else {
      // Initialize with some sample alerts if none exist
      const initialAlerts = [
        {
          id: 'alert-001',
          equipmentId: 'pump-003',
          timestamp: new Date(new Date().getTime() - 12 * 60000),
          message: 'Wellhead temperature exceeding normal range',
          parameter: 'temperature',
          value: 78.2,
          threshold: 75.0,
          priority: 'medium' as AlertPriority,
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
          priority: 'medium' as AlertPriority,
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
          priority: 'low' as AlertPriority,
          isAcknowledged: false
        }
      ];
      
      localStorage.setItem('vigia-alerts', JSON.stringify(initialAlerts));
      setActiveAlerts(initialAlerts);
    }
    
    // Clear the forceHideBadge parameter if it exists
    if (window.location.search.includes('forceHideBadge=true')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Generate alerts based on monitoring data
  useEffect(() => {
    if (!isSimulating) return;

    // Helper function to create an alert
    const createAlert = (
      parameter: string,
      value: number,
      threshold: number,
      message: string,
      priority: AlertPriority
    ): Alert => {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        equipmentId: parameter,
        timestamp: new Date(),
        message,
        parameter,
        value,
        threshold,
        priority,
        isAcknowledged: false
      };
    };

    // Check for alerts from real-time monitoring
    const checkRealTimeAlerts = () => {
      const newAlerts: Alert[] = [];
      
      // Check BOP pressure
      if (monitoring.bopPressure.status === 'warning' || monitoring.bopPressure.status === 'alert') {
        const { message, priority } = generateAlert('bopPressure', monitoring.bopPressure.value, 1700);
        newAlerts.push(createAlert('bopPressure', monitoring.bopPressure.value, 1700, message, priority));
      }
      
      // Check wellhead temperature
      if (monitoring.wellheadTemperature.status === 'warning' || monitoring.wellheadTemperature.status === 'alert') {
        const { message, priority } = generateAlert('wellheadTemperature', monitoring.wellheadTemperature.value, 95);
        newAlerts.push(createAlert('wellheadTemperature', monitoring.wellheadTemperature.value, 95, message, priority));
      }
      
      // Check gas detection
      if (monitoring.gasDetection.status === 'warning' || monitoring.gasDetection.status === 'alert') {
        const { message, priority } = generateAlert('gasDetection', monitoring.gasDetection.value, 5.0);
        newAlerts.push(createAlert('gasDetection', monitoring.gasDetection.value, 5.0, message, priority));
      }
      
      // Check seal integrity
      if (monitoring.sealIntegrity.status === 'warning' || monitoring.sealIntegrity.status === 'alert') {
        const { message, priority } = generateAlert('sealIntegrity', monitoring.sealIntegrity.value, 85);
        newAlerts.push(createAlert('sealIntegrity', monitoring.sealIntegrity.value, 85, message, priority));
      }
      
      // Check pipe corrosion
      if (monitoring.pipeCorrosion.status === 'warning' || monitoring.pipeCorrosion.status === 'alert') {
        const { message, priority } = generateAlert('pipeCorrosion', monitoring.pipeCorrosion.value, 0.3);
        newAlerts.push(createAlert('pipeCorrosion', monitoring.pipeCorrosion.value, 0.3, message, priority));
      }
      
      // Check next maintenance
      if (monitoring.nextMaintenance.status === 'warning' || monitoring.nextMaintenance.status === 'alert') {
        const { message, priority } = generateAlert('nextMaintenance', monitoring.nextMaintenance.value, 3);
        newAlerts.push(createAlert('nextMaintenance', monitoring.nextMaintenance.value, 3, message, priority));
      }
      
      // Check PPE compliance
      const ppeThreshold = 90;
      
      if (complianceStatus.hardHat === 'warning' || complianceStatus.hardHat === 'critical') {
        newAlerts.push(createAlert(
          'hardHat',
          ppeComplianceData.hardHat,
          ppeThreshold,
          `Hard Hat compliance at ${ppeComplianceData.hardHat}% - below ${ppeThreshold}% threshold`,
          complianceStatus.hardHat === 'critical' ? 'medium' : 'low'
        ));
      }
      
      if (complianceStatus.safetyVests === 'warning' || complianceStatus.safetyVests === 'critical') {
        newAlerts.push(createAlert(
          'safetyVests',
          ppeComplianceData.safetyVests,
          ppeThreshold,
          `Safety vest compliance at ${ppeComplianceData.safetyVests}% - below ${ppeThreshold}% threshold`,
          complianceStatus.safetyVests === 'critical' ? 'medium' : 'low'
        ));
      }
      
      if (complianceStatus.protectiveGloves === 'warning' || complianceStatus.protectiveGloves === 'critical') {
        newAlerts.push(createAlert(
          'protectiveGloves',
          ppeComplianceData.protectiveGloves,
          ppeThreshold,
          `Protective gloves compliance at ${ppeComplianceData.protectiveGloves}% - below ${ppeThreshold}% threshold`,
          complianceStatus.protectiveGloves === 'critical' ? 'medium' : 'low'
        ));
      }
      
      return newAlerts;
    };

    // Update alerts
    const interval = setInterval(() => {
      const newAlerts = checkRealTimeAlerts();
      
      // Add new alerts only if they don't exist yet
      if (newAlerts.length > 0) {
        setActiveAlerts(prev => {
          // Filter out duplicate alerts (same parameter within last 5 minutes)
          const filteredNew = newAlerts.filter(newAlert => {
            return !prev.some(existingAlert => 
              existingAlert.parameter === newAlert.parameter && 
              (new Date().getTime() - new Date(existingAlert.timestamp).getTime()) < 5 * 60 * 1000
            );
          });
          
          if (filteredNew.length > 0) {
            // Update localStorage with new alerts
            const storedAlerts = localStorage.getItem('vigia-alerts') 
              ? JSON.parse(localStorage.getItem('vigia-alerts') || '[]')
              : [];
            
            const updatedAlerts = [...filteredNew, ...storedAlerts];
            localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
            
            // Show toast for high priority alerts
            filteredNew.forEach(alert => {
              if (alert.priority === 'high' || alert.priority === 'critical') {
                toast({
                  title: "New Alert",
                  description: alert.message,
                  variant: "destructive",
                });
              }
            });
            
            // Keep max 10 active alerts
            return [...filteredNew, ...prev].slice(0, 10);
          }
          
          return prev;
        });
      }
      
      // Randomly resolve some alerts
      if (activeAlerts.length > 0 && Math.random() < 0.1) {
        dismissAlert(activeAlerts[Math.floor(Math.random() * activeAlerts.length)].id);
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [
    isSimulating, 
    monitoring.bopPressure.status, 
    monitoring.wellheadTemperature.status,
    monitoring.gasDetection.status,
    monitoring.sealIntegrity.status,
    monitoring.pipeCorrosion.status,
    monitoring.nextMaintenance.status,
    ppeComplianceData,
    complianceStatus,
    activeAlerts.length,
    toast
  ]);

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vigia-alerts') {
        const allAlerts = e.newValue ? JSON.parse(e.newValue) : [];
        setActiveAlerts(allAlerts.filter((alert: Alert) => !alert.isAcknowledged));
        setResolvedAlerts(allAlerts.filter((alert: Alert) => alert.isAcknowledged).slice(0, 5));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mark all alerts as read
  const markAllRead = () => {
    const storedAlerts = localStorage.getItem('vigia-alerts')
      ? JSON.parse(localStorage.getItem('vigia-alerts') || '[]')
      : [];
    
    const updatedAlerts = storedAlerts.map((alert: Alert) => ({
      ...alert,
      isAcknowledged: true
    }));
    
    localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
    setResolvedAlerts(prev => [...activeAlerts, ...prev].slice(0, 10));
    setActiveAlerts([]);
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  // Dismiss a single alert
  const dismissAlert = (id: string) => {
    const storedAlerts = localStorage.getItem('vigia-alerts')
      ? JSON.parse(localStorage.getItem('vigia-alerts') || '[]')
      : [];
    
    const alertToResolve = activeAlerts.find(a => a.id === id);
    
    if (alertToResolve) {
      const updatedAlerts = storedAlerts.map((alert: Alert) => 
        alert.id === id ? { ...alert, isAcknowledged: true } : alert
      );
      
      localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
      setResolvedAlerts(prev => [alertToResolve, ...prev].slice(0, 10));
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Safety Alerts</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllRead} disabled={activeAlerts.length === 0}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button 
                variant={isSimulating ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsSimulating(!isSimulating)}
              >
                {isSimulating ? (
                  <>
                    <BellDot className="h-4 w-4 mr-2" />
                    Live Alerts
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Live
                  </>
                )}
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
                {activeAlerts.length} Active
              </span>
            </div>
            
            <div className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map(alert => (
                  <AlertItem 
                    key={alert.id}
                    alert={alert}
                    onDismiss={() => dismissAlert(alert.id)}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No active alerts
                </div>
              )}
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
              {resolvedAlerts.length > 0 ? (
                resolvedAlerts.map(alert => (
                  <AlertItem 
                    key={alert.id}
                    alert={{...alert, isAcknowledged: true}}
                    isResolved={true}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No resolved alerts
                </div>
              )}
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
  alert: Alert;
  onDismiss?: () => void;
  isResolved?: boolean;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onDismiss, isResolved = false }) => {
  const getLevelIcon = () => {
    switch (alert.priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-vigia-warning" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getTypeLabel = () => {
    if (alert.parameter.includes('pressure')) return 'Pressure';
    if (alert.parameter.includes('temperature')) return 'Temperature';
    if (alert.parameter.includes('gas')) return 'Gas Detection';
    if (alert.parameter.includes('seal')) return 'Equipment';
    if (alert.parameter.includes('corrosion')) return 'Maintenance';
    if (alert.parameter.includes('maintenance')) return 'Maintenance';
    if (alert.parameter.includes('Hat') || 
        alert.parameter.includes('vest') || 
        alert.parameter.includes('glass') || 
        alert.parameter.includes('glove')) return 'Compliance';
    return 'System';
  };
  
  const getLevelStyles = () => {
    switch (alert.priority) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-500/5';
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-4 border-l-vigia-warning bg-vigia-warning/5';
      case 'low':
        return 'border-l-4 border-l-blue-500 bg-blue-500/5';
      default:
        return isResolved 
          ? 'border-l-4 border-l-vigia-success bg-vigia-success/5' 
          : 'border-l-4 border-l-blue-500 bg-blue-500/5';
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
    <div className={`p-3 rounded-md ${getLevelStyles()}`}>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {getLevelIcon()}
          <h3 className="font-medium">{alert.message}</h3>
        </div>
        {onDismiss && !isResolved && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1 ml-7">
        {alert.value.toFixed(1)} {alert.parameter.includes('temperature') ? '°C' : ''} 
        {alert.parameter.includes('pressure') ? ' PSI' : ''}
        {(alert.parameter.includes('Hat') || alert.parameter.includes('vest') || 
          alert.parameter.includes('glass') || alert.parameter.includes('glove')) ? '%' : ''}
      </p>
      <div className="flex items-center justify-between mt-2 ml-7">
        <span className="text-xs bg-vigia-muted/20 text-muted-foreground py-0.5 px-2 rounded-full">
          {getTypeLabel()}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{getTimeString(alert.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
