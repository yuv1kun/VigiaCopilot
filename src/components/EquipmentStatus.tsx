
import React from 'react';
import { Card } from '@/components/ui/card';
import { HardDrive, Info, Power } from 'lucide-react';
import { useEquipmentStatus } from '@/hooks/useEquipmentStatus';

const EquipmentStatus: React.FC = () => {
  const { equipment, isActive } = useEquipmentStatus();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <span className="text-xs bg-vigia-success/20 text-vigia-success py-1 px-2 rounded-full">Operational</span>;
      case 'warning':
        return <span className="text-xs bg-vigia-warning/20 text-vigia-warning py-1 px-2 rounded-full">Warning</span>;
      case 'critical':
        return <span className="text-xs bg-vigia-danger/20 text-vigia-danger py-1 px-2 rounded-full animate-pulse">Critical</span>;
      case 'maintenance':
        return <span className="text-xs bg-vigia-blue/20 text-vigia-blue py-1 px-2 rounded-full">Maintenance</span>;
      default:
        return null;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'bg-vigia-success';
    if (score >= 75) return 'bg-vigia-warning';
    if (score >= 60) return 'bg-vigia-teal';
    return 'bg-vigia-danger';
  };

  return (
    <Card className="bg-vigia-card border-border h-full overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-vigia-teal" />
          <h2 className="font-medium">Equipment Status</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Autonomous BOP Analytics</span>
          </div>
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-vigia-success animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {equipment.map((item) => (
            <div key={item.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">ID: {item.id} • Last inspection: {item.lastInspection}</div>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>Health Score</span>
                  <span className={item.status === 'critical' ? 'animate-pulse text-vigia-danger' : ''}>
                    {item.healthScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getHealthScoreColor(item.healthScore)} rounded-full ${
                      item.status === 'critical' ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${item.healthScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default EquipmentStatus;
