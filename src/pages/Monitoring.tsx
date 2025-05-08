
import React from 'react';
import Header from '@/components/Header';
import MonitoringPanel from '@/components/MonitoringPanel';
import RealTimeEquipment from '@/components/RealTimeEquipment';

const Monitoring: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold mb-6">Monitoring Dashboard</h1>
          
          <div className="space-y-8">
            <RealTimeEquipment />
            <MonitoringPanel />
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

export default Monitoring;
