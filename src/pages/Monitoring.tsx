
import React from 'react';
import Header from '@/components/Header';
import MonitoringPanel from '@/components/MonitoringPanel';
import RealTimeEquipment from '@/components/RealTimeEquipment';
import AIAssistant from '@/components/AIAssistant';
import AlertSystem from '@/components/AlertSystem';
import EquipmentStatus from '@/components/EquipmentStatus';

const Monitoring: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <h1 className="text-2xl font-bold mb-8">Monitoring Dashboard</h1>
          
          <div className="space-y-10">
            {/* Real-time equipment monitoring section */}
            <RealTimeEquipment />
            
            {/* Split layout for monitoring panel and interactive sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MonitoringPanel />
              </div>
              <div className="space-y-6">
                <AIAssistant />
              </div>
            </div>
            
            {/* Advanced monitoring and alerts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col">
                <AlertSystem />
              </div>
              <div className="lg:col-span-1 flex flex-col">
                <EquipmentStatus />
              </div>
              <div className="lg:col-span-1 flex flex-col">
                <div className="bg-vigia-card border-border rounded-md h-full p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-vigia-teal"></span>
                    Historical Performance Analysis
                  </h3>
                  
                  <div className="text-center text-muted-foreground h-[80%] flex items-center justify-center text-sm">
                    <div>
                      <p>Historical data visualization available in the Analytics section</p>
                      <button className="mt-4 text-vigia-teal hover:underline">
                        View Analytics Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 px-6 border-t border-border mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Vigía Safety Copilot v1.0.0 | Offshore Oil Rig Monitoring System</p>
        </div>
      </footer>
    </div>
  );
};

export default Monitoring;
