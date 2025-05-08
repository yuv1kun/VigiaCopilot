
import React, { useState, useEffect } from 'react';
import { Bell, Eye, Gauge, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { Alert } from '@/types/equipment';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Fetch alerts from local storage or initialize
  useEffect(() => {
    const storedAlerts = localStorage.getItem('vigia-alerts');
    if (storedAlerts) {
      const parsedData = JSON.parse(storedAlerts);
      // Ensure timestamps are Date objects
      const parsedAlerts = parsedData.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
      
      setActiveAlerts(parsedAlerts.filter((alert: Alert) => !alert.isAcknowledged));
      setUnreadCount(parsedAlerts.filter((alert: Alert) => !alert.isAcknowledged).length);
    }
  }, []);

  // Listen for new alerts
  useEffect(() => {
    const handleStorageChange = () => {
      const storedAlerts = localStorage.getItem('vigia-alerts');
      if (storedAlerts) {
        const parsedData = JSON.parse(storedAlerts);
        // Ensure timestamps are Date objects
        const parsedAlerts = parsedData.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
        
        setActiveAlerts(parsedAlerts.filter((alert: Alert) => !alert.isAcknowledged));
        setUnreadCount(parsedAlerts.filter((alert: Alert) => !alert.isAcknowledged).length);
      }
    };

    // Check for new alerts more frequently (every 5 seconds)
    const interval = setInterval(() => {
      handleStorageChange();
    }, 5000);

    // Listen for storage events (if another tab updates alerts)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Simulate real-world oil rig alert patterns
  useEffect(() => {
    if (location.search.includes('forceHideBadge=true')) {
      setUnreadCount(0);
      return;
    }
    
    // Time-based alert patterns - more likely during morning shift change and evening operations
    const simulateOperationalPatterns = () => {
      const hour = new Date().getHours();
      
      // Higher risk periods: Early morning (5-8AM), shift changes (2-3PM), night operations (11PM-1AM)
      let alertProbability = 0.05; // Base probability
      
      if ((hour >= 5 && hour <= 8) || (hour >= 14 && hour <= 15) || (hour >= 23 || hour <= 1)) {
        alertProbability = 0.12; // Higher probability during critical periods
      }
      
      // Current weather or operational condition simulation
      const conditions = ["normal", "stormy", "maintenance", "high-production"];
      const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      if (currentCondition === "stormy") {
        alertProbability *= 1.5; // 50% more alerts during stormy conditions
      } else if (currentCondition === "maintenance") {
        alertProbability *= 1.3; // 30% more alerts during maintenance
      } else if (currentCondition === "high-production") {
        alertProbability *= 1.2; // 20% more alerts during high production
      }
      
      return Math.random() < alertProbability;
    };
    
    const interval = setInterval(() => {
      // Check if we should generate a new alert based on operational patterns
      if (simulateOperationalPatterns()) {
        // Types of alerts more specific to oil rig operations
        const alertTypes = [
          {
            message: "Pressure valve reading abnormal on wellhead #3",
            parameter: "pressure",
            priority: "medium" as "low" | "medium" | "high" | "critical", 
            threshold: 75
          },
          {
            message: "Temperature exceeding safe levels in pump system",
            parameter: "temperature",
            priority: "high" as "low" | "medium" | "high" | "critical",
            threshold: 90
          },
          {
            message: "H2S gas detection above threshold in sector B",
            parameter: "gas",
            priority: "critical" as "low" | "medium" | "high" | "critical",
            threshold: 10
          },
          {
            message: "Drill pipe vibration exceeding normal range",
            parameter: "vibration",
            priority: "medium" as "low" | "medium" | "high" | "critical",
            threshold: 65
          },
          {
            message: "BOP maintenance required before next operation",
            parameter: "maintenance",
            priority: "high" as "low" | "medium" | "high" | "critical",
            threshold: 48
          },
          {
            message: "PPE compliance below target in drilling area",
            parameter: "compliance",
            priority: "low" as "low" | "medium" | "high" | "critical",
            threshold: 95
          },
          {
            message: "Weather conditions approaching operational limits",
            parameter: "weather",
            priority: "medium" as "low" | "medium" | "high" | "critical",
            threshold: 80
          },
          {
            message: "Mud circulation pressure fluctuating in well #2",
            parameter: "mud-pressure",
            priority: "medium" as "low" | "medium" | "high" | "critical",
            threshold: 60
          }
        ];
        
        const selectedAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          equipmentId: `equipment-${Math.floor(Math.random() * 10)}`,
          timestamp: new Date(),
          message: selectedAlert.message,
          parameter: selectedAlert.parameter,
          value: selectedAlert.threshold * (0.8 + Math.random() * 0.4), // Value around threshold
          threshold: selectedAlert.threshold,
          priority: selectedAlert.priority,
          isAcknowledged: false
        };
        
        // Add to local storage
        const storedAlerts = localStorage.getItem('vigia-alerts') ? 
          JSON.parse(localStorage.getItem('vigia-alerts') || '[]') : [];
        
        const updatedAlerts = [newAlert, ...storedAlerts].slice(0, 20); // Keep max 20 alerts
        localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
        
        // Update state
        setActiveAlerts(prevAlerts => [newAlert, ...prevAlerts]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification for critical and high priority alerts only
        if (newAlert.priority === "critical" || newAlert.priority === "high") {
          toast({
            title: newAlert.priority === "critical" ? "CRITICAL ALERT" : "High Priority Alert",
            description: newAlert.message,
            variant: "destructive",
          });
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [location.search, toast]);

  // Mark all alerts as read
  const markAllAsRead = () => {
    const storedAlerts = localStorage.getItem('vigia-alerts') ? 
      JSON.parse(localStorage.getItem('vigia-alerts') || '[]') : [];
    
    const updatedAlerts = storedAlerts.map((alert: Alert) => ({
      ...alert,
      isAcknowledged: true
    }));
    
    localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
    setActiveAlerts([]);
    setUnreadCount(0);
    setShowPopover(false);
  };

  // Mark single alert as read
  const markAsRead = (id: string) => {
    const storedAlerts = localStorage.getItem('vigia-alerts') ? 
      JSON.parse(localStorage.getItem('vigia-alerts') || '[]') : [];
    
    const updatedAlerts = storedAlerts.map((alert: Alert) => 
      alert.id === id ? { ...alert, isAcknowledged: true } : alert
    );
    
    localStorage.setItem('vigia-alerts', JSON.stringify(updatedAlerts));
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatTimeAgo = (date: Date) => {
    // Ensure we're working with a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Get appropriate alert icon/class based on priority
  const getAlertIndicator = (priority: "low" | "medium" | "high" | "critical") => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
      default:
        return "bg-blue-500";
    }
  };

  return (
    <header className="bg-vigia-card border-b border-border py-3 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/17558/17558770.png" 
                  alt="Vigía Logo" 
                  className="h-6 w-6" 
                />
                <h1 className="text-xl font-bold">Vigía <span className="text-vigia-teal">Safety Copilot</span></h1>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant={isActive('/') ? "default" : "ghost"} 
              className="flex items-center space-x-1" 
              size="sm"
              asChild
            >
              <Link to="/">
                <Gauge className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button 
              variant={isActive('/monitoring') ? "default" : "ghost"} 
              className="flex items-center space-x-1" 
              size="sm"
              asChild
            >
              <Link to="/monitoring">
                <Eye className="h-4 w-4" />
                <span>Monitoring</span>
              </Link>
            </Button>
            <Button 
              variant={isActive('/maintenance') ? "default" : "ghost"} 
              className="flex items-center space-x-1" 
              size="sm"
              asChild
            >
              <Link to="/maintenance">
                <Wrench className="h-4 w-4" />
                <span>Maintenance</span>
              </Link>
            </Button>
            <Button 
              variant={isActive('/alerts') ? "default" : "ghost"} 
              className="flex items-center space-x-1" 
              size="sm"
              asChild
            >
              <Link to="/alerts">
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </Link>
            </Button>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Popover open={showPopover} onOpenChange={setShowPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vigia-warning opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-vigia-warning"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-medium">Alerts</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    disabled={activeAlerts.length === 0}
                    className="h-7 text-xs"
                  >
                    Mark all as read
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {activeAlerts.length > 0 ? (
                    activeAlerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "p-3 border-b border-border hover:bg-accent/50 cursor-pointer",
                          alert.priority === 'critical' && "border-l-4 border-l-red-500",
                          alert.priority === 'high' && "border-l-4 border-l-orange-500",
                          alert.priority === 'medium' && "border-l-4 border-l-yellow-500",
                          alert.priority === 'low' && "border-l-4 border-l-blue-500"
                        )}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${getAlertIndicator(alert.priority)}`}></span>
                            <p className="font-medium text-sm">{alert.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-4">
                          {alert.parameter.charAt(0).toUpperCase() + alert.parameter.slice(1)}: 
                          {typeof alert.value === 'number' ? ` ${alert.value.toFixed(1)}` : ' N/A'}
                          {alert.parameter.includes('temperature') ? '°C' : ''}
                          {alert.parameter.includes('pressure') ? ' PSI' : ''}
                          {alert.parameter.includes('compliance') || alert.parameter.includes('integrity') ? '%' : ''}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <Link to="/alerts">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => setShowPopover(false)}
                    >
                      View all alerts
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
            <div className="h-8 w-8 rounded-full bg-vigia-teal flex items-center justify-center">
              <span className="text-xs font-medium">OP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
