
import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Wrench, Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold mb-6">Maintenance Schedule</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-vigia-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-vigia-teal" />
                  <h2 className="text-lg font-medium">Upcoming Maintenance</h2>
                </div>
                <span className="text-xs bg-vigia-success/20 text-vigia-success py-1 px-2 rounded-full">
                  Scheduled
                </span>
              </div>
              
              <div className="space-y-4">
                <MaintenanceItem
                  title="BOP Pressure System Inspection"
                  date="May 12, 2025"
                  status="scheduled"
                  priority="high"
                />
                <MaintenanceItem
                  title="Hydraulic Line Replacement"
                  date="May 15, 2025"
                  status="scheduled"
                  priority="medium"
                />
                <MaintenanceItem
                  title="Seal Integrity Check"
                  date="May 18, 2025"
                  status="scheduled"
                  priority="medium"
                />
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
                <MaintenanceItem
                  title="Wellhead Temperature Calibration"
                  date="May 3, 2025"
                  status="completed"
                  priority="high"
                />
                <MaintenanceItem
                  title="Gas Detection System Check"
                  date="May 2, 2025"
                  status="completed"
                  priority="high"
                />
                <MaintenanceItem
                  title="Pipe Corrosion Inspection"
                  date="Apr 28, 2025"
                  status="completed"
                  priority="medium"
                />
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
  status: 'scheduled' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const MaintenanceItem: React.FC<MaintenanceItemProps> = ({ title, date, status, priority }) => {
  return (
    <div className="border border-border rounded-md p-3">
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
          <span>Estimated time: 3 hours</span>
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

const StatusBadge: React.FC<{ status: 'scheduled' | 'in-progress' | 'completed' }> = ({ status }) => {
  const colors = {
    scheduled: "bg-vigia-muted/20 text-muted-foreground",
    'in-progress': "bg-vigia-warning/20 text-vigia-warning",
    completed: "bg-vigia-success/20 text-vigia-success"
  };
  
  return (
    <span className={`text-xs ${colors[status]} py-0.5 px-2 rounded-full`}>
      {status}
    </span>
  );
};

export default Maintenance;
