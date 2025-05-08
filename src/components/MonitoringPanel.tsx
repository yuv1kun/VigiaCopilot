
import React from 'react';
import StatusCard from './StatusCard';
import { Gauge, Thermometer, AlertTriangle, Eye, Power, PowerOff, Shield, Info, Wrench, HardHat, Glasses, Shirt, Hand } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { usePPECompliance } from '@/hooks/usePPECompliance';

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
  
  const { ppeComplianceData, isActive } = usePPECompliance(isSimulating, 2000); // Update every 2 seconds
  
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
            <span className={`text-xs py-1 px-2 rounded-full ${isSimulating ? 'bg-vigia-success/20 text-vigia-success' : 'bg-vigia-muted/30 text-muted-foreground'}`}>
              {isSimulating ? 'Live' : 'Paused'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4" />
                <span className="text-sm">Hard Hat Compliance</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full ${getComplianceColor(ppeComplianceData.hardHat)} rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${ppeComplianceData.hardHat}%` }}
                  ></div>
                </div>
                <span className="text-sm">{ppeComplianceData.hardHat}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Glasses className="h-4 w-4" />
                <span className="text-sm">Safety Glasses</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full ${getComplianceColor(ppeComplianceData.safetyGlasses)} rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${ppeComplianceData.safetyGlasses}%` }}
                  ></div>
                </div>
                <span className="text-sm">{ppeComplianceData.safetyGlasses}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4" />
                <span className="text-sm">Safety Vests</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full ${getComplianceColor(ppeComplianceData.safetyVests)} rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${ppeComplianceData.safetyVests}%` }}
                  ></div>
                </div>
                <span className="text-sm">{ppeComplianceData.safetyVests}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hand className="h-4 w-4" />
                <span className="text-sm">Protective Gloves</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-vigia-muted/30 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full ${getComplianceColor(ppeComplianceData.protectiveGloves)} rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${ppeComplianceData.protectiveGloves}%` }}
                  ></div>
                </div>
                <span className="text-sm">{ppeComplianceData.protectiveGloves}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get color based on compliance percentage
const getComplianceColor = (value: number): string => {
  if (value >= 95) return 'bg-vigia-teal';
  if (value >= 85) return 'bg-vigia-success';
  if (value >= 75) return 'bg-vigia-warning';
  return 'bg-vigia-danger';
};

export default MonitoringPanel;
