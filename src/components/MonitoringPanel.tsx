
import React from 'react';
import StatusCard from './StatusCard';
import { Gauge, Thermometer, Triangle, Eye, Bell, HardDrive, Info, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const MonitoringPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Real-Time Equipment & Safety Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="BOP Pressure"
            value="1420 PSI"
            status="normal"
            icon={<Gauge className="h-4 w-4" />}
            trend={{ value: 2, direction: 'up' }}
          />
          <StatusCard
            title="Wellhead Temperature"
            value="85°C"
            status="warning"
            icon={<Thermometer className="h-4 w-4" />}
            trend={{ value: 12, direction: 'up' }}
          />
          <StatusCard
            title="Gas Detection"
            value="3.2 ppm"
            status="normal"
            icon={<Triangle className="h-4 w-4" />}
            trend={{ value: 0, direction: 'flat' }}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Predictive Maintenance & Corrosion</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="Seal Integrity"
            value="96%"
            status="normal"
            icon={<Shield className="h-4 w-4" />}
            trend={{ value: 1, direction: 'down' }}
          />
          <StatusCard
            title="Pipe Corrosion Est."
            value="0.23 mm/yr"
            status="warning"
            icon={<Info className="h-4 w-4" />}
            trend={{ value: 5, direction: 'up' }}
          />
          <StatusCard
            title="Next Maintenance"
            value="7 days"
            status="normal"
            icon={<Wrench className="h-4 w-4" />}
            trend={{ value: 0, direction: 'flat' }}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Safety Compliance</h2>
        <Card className="p-4 bg-vigia-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-vigia-teal" />
              <h3 className="font-medium">PPE Detection Status</h3>
            </div>
            <span className="text-xs bg-vigia-success/20 text-vigia-success py-1 px-2 rounded-full">
              Live
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Hard Hat Compliance</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-vigia-success rounded-full" style={{ width: '96%' }}></div>
                </div>
                <span className="text-sm">96%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Safety Glasses</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-vigia-teal rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-sm">100%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Safety Vests</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-vigia-warning rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-sm">82%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Protective Gloves</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-vigia-warning rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm">78%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringPanel;
