
import React from 'react';
import StatusCard from './StatusCard';
import { Gauge, Thermometer, AlertTriangle, Eye, Power, PowerOff, Shield, Info, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';

const MonitoringPanel: React.FC = () => {
  const { 
    bopPressure, 
    wellheadTemperature, 
    gasDetection,
    sealIntegrity,
    pipeCorrosion,
    nextMaintenance,
    isSimulating,
    toggleSimulation
  } = useRealTimeMonitoring(1000); // Update every second
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Real-Time Equipment & Safety Monitoring</h2>
          <button 
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs
              ${isSimulating ? 'bg-vigia-success/20 text-vigia-success' : 'bg-vigia-muted/30 text-muted-foreground'}`}
          >
            {isSimulating ? (
              <>
                <Power className="h-3 w-3" /> Live Data
              </>
            ) : (
              <>
                <PowerOff className="h-3 w-3" /> Paused
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="BOP Pressure"
            value={bopPressure.formattedValue}
            status={bopPressure.status}
            icon={<Gauge className="h-4 w-4" />}
            trend={bopPressure.trend}
          />
          <StatusCard
            title="Wellhead Temperature"
            value={wellheadTemperature.formattedValue}
            status={wellheadTemperature.status}
            icon={<Thermometer className="h-4 w-4" />}
            trend={wellheadTemperature.trend}
          />
          <StatusCard
            title="Gas Detection"
            value={gasDetection.formattedValue}
            status={gasDetection.status}
            icon={<AlertTriangle className="h-4 w-4" />}
            trend={gasDetection.trend}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Predictive Maintenance & Corrosion</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="Seal Integrity"
            value={sealIntegrity.formattedValue}
            status={sealIntegrity.status}
            icon={<Shield className="h-4 w-4" />}
            trend={sealIntegrity.trend}
          />
          <StatusCard
            title="Pipe Corrosion Est."
            value={pipeCorrosion.formattedValue}
            status={pipeCorrosion.status}
            icon={<Info className="h-4 w-4" />}
            trend={pipeCorrosion.trend}
          />
          <StatusCard
            title="Next Maintenance"
            value={nextMaintenance.formattedValue}
            status={nextMaintenance.status}
            icon={<Wrench className="h-4 w-4" />}
            trend={nextMaintenance.trend}
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
