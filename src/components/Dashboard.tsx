
import React from 'react';
import MonitoringPanel from './MonitoringPanel';
import AIAssistant from './AIAssistant';
import AlertSystem from './AlertSystem';
import EquipmentStatus from './EquipmentStatus';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonitoringPanel />
        </div>
        <div className="h-[600px]">
          <AIAssistant />
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <AlertSystem />
        </div>
        <div className="h-[400px]">
          <EquipmentStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
