
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Wrench, Calendar, AlertCircle, Clock, CheckCircle, Power, PowerOff, Bell } from 'lucide-react';
import { useMaintenanceSchedule } from '@/hooks/useMaintenanceSchedule';
import { useToast } from '@/hooks/use-toast';

const Maintenance: React.FC = () => {
  const { 
    upcomingMaintenance, 
    completedMaintenance, 
    isSimulating, 
    toggleSimulation,
    lastEvent,
    clearLastEvent
  } = useMaintenanceSchedule(5000); // Update every 5 seconds for demo purposes
  
  const { toast } = useToast();
  
  // Show toast notifications for maintenance events
  useEffect(() => {
    if (lastEvent) {
      let title = '';
      let description = '';
      let variant: 'default' | 'destructive' = 'default';
      
      switch (lastEvent.type) {
        case 'complete':
          title = 'Maintenance Completed';
          description = `${lastEvent.item?.title} has been marked as completed.`;
          break;
        case 'delay':
          title = 'Maintenance Delayed';
          description = `${lastEvent.item?.title} has been rescheduled.`;
          variant = 'destructive';
          break;
        case 'new':
          title = 'New Maintenance Scheduled';
          description = `${lastEvent.item?.title} has been added to the schedule.`;
          break;
        case 'start':
          title = 'Maintenance Started';
          description = `Work has begun on ${lastEvent.item?.title}.`;
          break;
        case 'emergency':
          title = 'EMERGENCY MAINTENANCE';
          description = `${lastEvent.item?.title} requires immediate attention!`;
          variant = 'destructive';
          break;
      }
      
      toast({
        title,
        description,
        variant
      });
      
      clearLastEvent();
    }
  }, [lastEvent, toast, clearLastEvent]);

  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Maintenance Schedule</h1>
            <button 
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm
                ${isSimulating ? 'bg-vigia-success/20 text-vigia-success' : 'bg-vigia-muted/30 text-muted-foreground'}`}
            >
              {isSimulating ? (
                <>
                  <Power className="h-4 w-4" /> Live Updates
                </>
              ) : (
                <>
                  <PowerOff className="h-4 w-4" /> Updates Paused
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-vigia-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-vigia-teal" />
                  <h2 className="text-lg font-medium">Upcoming Maintenance</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {upcomingMaintenance.some(item => item.status === 'overdue') && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-vigia-danger rounded-full"></span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingMaintenance.length > 0 ? (
                  upcomingMaintenance.map(item => (
                    <MaintenanceItem
                      key={item.id}
                      title={item.title}
                      date={item.date}
                      status={item.status}
                      priority={item.priority as 'low' | 'medium' | 'high'}
                      estimatedTime={item.estimatedTime}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No upcoming maintenance tasks</p>
                  </div>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-vigia-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-vigia-success" />
                  <h2 className="text-lg font-medium">Completed Maintenance</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {completedMaintenance.length > 0 ? (
                  completedMaintenance.map(item => (
                    <MaintenanceItem
                      key={item.id}
                      title={item.title}
                      date={item.date}
                      status={item.status}
                      priority={item.priority as 'low' | 'medium' | 'high'}
                      estimatedTime={item.estimatedTime}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No completed maintenance tasks</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
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

interface MaintenanceItemProps {
  title: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

const MaintenanceItem: React.FC<MaintenanceItemProps> = ({ title, date, status, priority, estimatedTime }) => {
  return (
    <div className={`border border-border rounded-md p-3 transition-all ${
      status === 'overdue' ? 'bg-vigia-danger/5 animate-pulse border-vigia-danger/30' : ''
    }`}>
      <div className="flex justify-between">
        <h3 className="font-medium">{title}</h3>
        <PriorityBadge priority={priority} />
      </div>
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Estimated time: {estimatedTime} hours</span>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({ priority }) => {
  const colors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`text-xs ${colors[priority]} py-0.5 px-2 rounded-full`}>
      {priority}
    </span>
  );
};

const StatusBadge: React.FC<{ status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' }> = ({ status }) => {
  const colors = {
    scheduled: "bg-vigia-muted/20 text-muted-foreground",
    'in-progress': "bg-vigia-warning/20 text-vigia-warning",
    completed: "bg-vigia-success/20 text-vigia-success",
    overdue: "bg-vigia-danger/20 text-vigia-danger"
  };
  
  return (
    <span className={`text-xs ${colors[status]} py-0.5 px-2 rounded-full`}>
      {status}
    </span>
  );
};

export default Maintenance;
