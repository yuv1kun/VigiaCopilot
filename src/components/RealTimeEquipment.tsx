
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Settings, Gauge, Power, PowerOff } from 'lucide-react';

// Simulated data setup
type EquipmentStatus = 'running' | 'warning' | 'failure' | 'offline';

interface EquipmentData {
  id: string;
  name: string;
  type: 'pump' | 'compressor';
  status: EquipmentStatus;
  pressure: number;
  temperature: number;
  vibration: number;
  rpm: number;
  efficiency: number;
  operatingHours: number;
  lastMaintenance: string;
  history: {
    time: string;
    pressure: number;
    temperature: number;
    vibration: number;
    rpm: number;
  }[];
}

// Initial simulated equipment data
const initialEquipments: EquipmentData[] = [
  {
    id: 'pump-001',
    name: 'Primary Pump',
    type: 'pump',
    status: 'running',
    pressure: 1250,
    temperature: 65,
    vibration: 0.8,
    rpm: 1800,
    efficiency: 92,
    operatingHours: 2450,
    lastMaintenance: '2025-04-12',
    history: generateInitialHistory(),
  },
  {
    id: 'comp-002',
    name: 'Main Compressor',
    type: 'compressor',
    status: 'running',
    pressure: 850,
    temperature: 72,
    vibration: 1.2,
    rpm: 3600,
    efficiency: 88,
    operatingHours: 1850,
    lastMaintenance: '2025-04-15',
    history: generateInitialHistory(),
  },
  {
    id: 'pump-003',
    name: 'Secondary Pump',
    type: 'pump',
    status: 'warning',
    pressure: 980,
    temperature: 78,
    vibration: 2.1,
    rpm: 1650,
    efficiency: 84,
    operatingHours: 3200,
    lastMaintenance: '2025-03-22',
    history: generateInitialHistory(),
  },
];

// Generate initial history data
function generateInitialHistory() {
  const history = [];
  const now = new Date();
  
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    history.push({
      time,
      pressure: 800 + Math.random() * 700,
      temperature: 60 + Math.random() * 25,
      vibration: 0.5 + Math.random() * 2,
      rpm: 1600 + Math.random() * 2200,
    });
  }
  
  return history;
}

// Simulate random fluctuations in data
function updateEquipmentData(data: EquipmentData): EquipmentData {
  const now = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  let pressureDelta = (Math.random() - 0.5) * 50;
  let tempDelta = (Math.random() - 0.5) * 3;
  let vibrationDelta = (Math.random() - 0.5) * 0.3;
  let rpmDelta = (Math.random() - 0.5) * 100;
  
  // Add some more dramatic changes occasionally
  if (Math.random() > 0.95) {
    pressureDelta *= 3;
    tempDelta *= 2;
    vibrationDelta *= 3;
  }
  
  const newPressure = Math.max(400, Math.min(2000, data.pressure + pressureDelta));
  const newTemp = Math.max(40, Math.min(95, data.temperature + tempDelta));
  const newVibration = Math.max(0.1, Math.min(3.5, data.vibration + vibrationDelta));
  const newRpm = Math.max(1000, Math.min(4000, data.rpm + rpmDelta));
  
  // Determine status based on conditions
  let newStatus: EquipmentStatus = 'running';
  if (newTemp > 85 || newVibration > 2.5) {
    newStatus = 'warning';
  }
  if (newTemp > 90 || newVibration > 3.0) {
    newStatus = 'failure';
  }
  
  // Calculate efficiency based on conditions
  let newEfficiency = 95 - (newTemp - 60) * 0.5 - newVibration * 3;
  newEfficiency = Math.max(60, Math.min(95, newEfficiency));
  
  const newHistory = [...data.history.slice(1), {
    time: now,
    pressure: newPressure,
    temperature: newTemp,
    vibration: newVibration,
    rpm: newRpm,
  }];
  
  return {
    ...data,
    status: newStatus,
    pressure: newPressure,
    temperature: newTemp,
    vibration: newVibration,
    rpm: newRpm,
    efficiency: Number(newEfficiency.toFixed(1)),
    history: newHistory,
  };
}

// Status indicator component
const StatusIndicator: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-vigia-success animate-pulse';
      case 'warning': return 'bg-vigia-warning animate-pulse';
      case 'failure': return 'bg-vigia-error animate-pulse';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'running': return 'Operational';
      case 'warning': return 'Warning';
      case 'failure': return 'Critical';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center">
      <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor()}`}></div>
      <span>{getStatusText()}</span>
    </div>
  );
};

// Equipment card component
const EquipmentCard: React.FC<{ equipment: EquipmentData }> = ({ equipment }) => {
  const chartConfig = {
    pressure: { color: "#33C3F0" },
    temperature: { color: "#F97316" },
    vibration: { color: "#D946EF" },
  };
  
  const getParameterStatus = (parameter: string, value: number) => {
    switch (parameter) {
      case 'temperature':
        return value > 85 ? 'text-vigia-warning' : value > 75 ? 'text-amber-500' : 'text-vigia-success';
      case 'vibration':
        return value > 2.5 ? 'text-vigia-warning' : value > 1.8 ? 'text-amber-500' : 'text-vigia-success';
      case 'pressure':
        return value > 1800 || value < 600 ? 'text-vigia-warning' : 'text-vigia-success';
      default:
        return 'text-foreground';
    }
  };
  
  const getIcon = () => {
    if (equipment.status === 'offline') {
      return <PowerOff className="h-5 w-5" />;
    }
    return equipment.type === 'pump' ? 
      <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} /> : 
      <Gauge className="h-5 w-5" />;
  };
  
  return (
    <Card className="bg-vigia-card border-border hover:border-vigia-teal/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg font-semibold">{equipment.name}</CardTitle>
          </div>
          <StatusIndicator status={equipment.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pressure:</span>
                <span className={getParameterStatus('pressure', equipment.pressure)}>{equipment.pressure} PSI</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temperature:</span>
                <span className={getParameterStatus('temperature', equipment.temperature)}>{equipment.temperature}°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vibration:</span>
                <span className={getParameterStatus('vibration', equipment.vibration)}>{equipment.vibration} mm/s</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RPM:</span>
                <span>{equipment.rpm}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Run Hours:</span>
                <span>{equipment.operatingHours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Efficiency:</span>
                <span className={equipment.efficiency < 85 ? 'text-vigia-warning' : 'text-vigia-success'}>
                  {equipment.efficiency}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="text-sm font-medium pb-1 flex justify-between">
              <span>Efficiency</span>
              <span>{equipment.efficiency}%</span>
            </div>
            <Progress 
              value={equipment.efficiency} 
              className="h-2"
              indicatorClassName={
                equipment.efficiency > 90 ? "bg-vigia-success" : 
                equipment.efficiency > 80 ? "bg-vigia-teal" : 
                equipment.efficiency > 70 ? "bg-amber-500" : "bg-vigia-warning"
              }
            />
          </div>
          
          <div className="h-[160px] mt-4">
            <p className="text-sm font-medium mb-2">Performance History (Last 20 minutes)</p>
            <ChartContainer className="h-[160px]" config={chartConfig}>
              <LineChart data={equipment.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9 }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value.split(':')[1] + ':' + value.split(':')[2]}
                />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pressure" 
                  name="Pressure"
                  stroke="#33C3F0" 
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperature" 
                  name="Temperature"
                  stroke="#F97316" 
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="vibration" 
                  name="Vibration"
                  stroke="#D946EF" 
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RealTimeEquipment: React.FC = () => {
  const [equipments, setEquipments] = useState<EquipmentData[]>(initialEquipments);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setEquipments(currentEquipment => 
        currentEquipment.map(equipment => updateEquipmentData(equipment))
      );
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Real-Time Equipment Monitoring</h2>
        <button 
          onClick={toggleSimulation}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm
            ${isSimulating ? 'bg-vigia-success/20 text-vigia-success' : 'bg-vigia-muted/30 text-muted-foreground'}`}
        >
          {isSimulating ? (
            <>
              <Power className="h-4 w-4" /> Live Data
            </>
          ) : (
            <>
              <PowerOff className="h-4 w-4" /> Paused
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipments.map(equipment => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </div>
    </div>
  );
};

export default RealTimeEquipment;
