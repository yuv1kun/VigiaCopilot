
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Settings, Gauge, Power, PowerOff, Download, Clock, Info } from 'lucide-react';
import { EquipmentData, EquipmentStatus } from '@/types/equipment';
import { 
  simulatePressure, 
  simulateTemperature, 
  simulateVibration, 
  simulateRPM,
  calculateEfficiency,
  determineEquipmentStatus,
  getCurrentOperationalState,
  calculateHealthScore
} from '@/utils/simulationUtils';

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
    maintenanceDue: 7,
    healthScore: 87,
    history: generateInitialHistory(),
    components: [
      {
        name: 'Main Bearing',
        status: 'normal',
        healthScore: 85,
        installDate: '2025-01-15',
        estimatedLifeRemaining: 78
      },
      {
        name: 'Shaft Seal',
        status: 'normal',
        healthScore: 92,
        installDate: '2025-03-20',
        estimatedLifeRemaining: 95
      },
      {
        name: 'Impeller',
        status: 'normal',
        healthScore: 88,
        installDate: '2024-11-05',
        estimatedLifeRemaining: 72
      }
    ]
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
    maintenanceDue: 14,
    healthScore: 92,
    history: generateInitialHistory(),
    components: [
      {
        name: 'Motor',
        status: 'normal',
        healthScore: 96,
        installDate: '2025-02-10',
        estimatedLifeRemaining: 92
      },
      {
        name: 'Valve Assembly',
        status: 'normal',
        healthScore: 89,
        installDate: '2025-01-25',
        estimatedLifeRemaining: 82
      },
      {
        name: 'Air Filter',
        status: 'warning',
        healthScore: 76,
        installDate: '2024-12-20',
        estimatedLifeRemaining: 35
      }
    ]
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
    maintenanceDue: 0,
    healthScore: 74,
    history: generateInitialHistory(),
    components: [
      {
        name: 'Main Bearing',
        status: 'warning',
        healthScore: 68,
        installDate: '2024-10-05',
        estimatedLifeRemaining: 41
      },
      {
        name: 'Shaft Seal',
        status: 'warning',
        healthScore: 72,
        installDate: '2024-11-15',
        estimatedLifeRemaining: 38
      },
      {
        name: 'Impeller',
        status: 'normal',
        healthScore: 81,
        installDate: '2025-01-20',
        estimatedLifeRemaining: 70
      }
    ]
  },
];

// Generate initial history data with more realistic patterns
function generateInitialHistory() {
  const history = [];
  const now = new Date();
  
  // Base values with slight randomness
  let basePressure = 1100 + Math.random() * 200;
  let baseTemp = 62 + Math.random() * 10;
  let baseVibration = 0.7 + Math.random() * 0.5;
  let baseRPM = 1700 + Math.random() * 300;
  
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Create realistic patterns with some continuity
    basePressure += (Math.random() - 0.5) * 20;
    baseTemp += (Math.random() - 0.5) * 0.3;
    baseVibration += (Math.random() - 0.5) * 0.1;
    baseRPM += (Math.random() - 0.5) * 30;
    
    // Add occasional spikes or drops to make it look more realistic
    if (Math.random() > 0.95) {
      basePressure += (Math.random() > 0.5 ? 1 : -1) * 50;
    }
    if (Math.random() > 0.98) {
      baseVibration += 0.4;
    }
    
    // Keep within realistic bounds
    basePressure = Math.max(800, Math.min(1800, basePressure));
    baseTemp = Math.max(50, Math.min(85, baseTemp));
    baseVibration = Math.max(0.5, Math.min(2.5, baseVibration));
    baseRPM = Math.max(1400, Math.min(3800, baseRPM));
    
    history.push({
      time,
      pressure: basePressure,
      temperature: baseTemp,
      vibration: baseVibration,
      rpm: baseRPM,
    });
  }
  
  return history;
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

// Equipment card component with enhanced visuals and analytics
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

  // Calculate moving averages for the chart
  const pressureData = equipment.history.map(point => point.pressure);
  const temperatureData = equipment.history.map(point => point.temperature);
  const vibrationData = equipment.history.map(point => point.vibration);
  
  // Add trend indicators
  const currentValue = (data: number[]) => data[data.length - 1];
  const previousValue = (data: number[]) => data[data.length - 5]; // 5 minutes ago
  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const pressureTrend = getTrendPercentage(currentValue(pressureData), previousValue(pressureData));
  const temperatureTrend = getTrendPercentage(currentValue(temperatureData), previousValue(temperatureData));
  const vibrationTrend = getTrendPercentage(currentValue(vibrationData), previousValue(vibrationData));
  
  const formatTrend = (trend: number) => {
    const abs = Math.abs(trend);
    if (abs < 0.5) return '0%';
    return `${trend > 0 ? '+' : ''}${abs.toFixed(1)}%`;
  };
  
  // Get trend direction
  const getTrendIcon = (trend: number, badTrend: boolean = false) => {
    if (Math.abs(trend) < 0.5) {
      return <span className="text-muted-foreground">━</span>;
    }
    
    if (trend > 0) {
      return <span className={badTrend ? 'text-vigia-warning' : 'text-vigia-success'}>↑</span>;
    }
    
    return <span className={badTrend ? 'text-vigia-success' : 'text-vigia-warning'}>↓</span>;
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
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pressure:</span>
                <span className={getParameterStatus('pressure', equipment.pressure)}>
                  {equipment.pressure.toFixed(0)} PSI {getTrendIcon(pressureTrend)} 
                  <span className="text-xs ml-1">{formatTrend(pressureTrend)}</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temperature:</span>
                <span className={getParameterStatus('temperature', equipment.temperature)}>
                  {equipment.temperature.toFixed(1)}°C {getTrendIcon(temperatureTrend, true)} 
                  <span className="text-xs ml-1">{formatTrend(temperatureTrend)}</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vibration:</span>
                <span className={getParameterStatus('vibration', equipment.vibration)}>
                  {equipment.vibration.toFixed(2)} mm/s {getTrendIcon(vibrationTrend, true)} 
                  <span className="text-xs ml-1">{formatTrend(vibrationTrend)}</span>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RPM:</span>
                <span>{equipment.rpm.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Run Hours:</span>
                <span>{equipment.operatingHours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Health:</span>
                <span className={
                  equipment.healthScore > 85 ? 'text-vigia-success' : 
                  equipment.healthScore > 70 ? 'text-vigia-teal' : 
                  'text-vigia-warning'
                }>
                  {equipment.healthScore.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="text-sm font-medium pb-1 flex justify-between">
              <div className="flex items-center gap-1">
                <span>Efficiency</span>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Next Maintenance: {equipment.maintenanceDue === 0 ? 'Due Now' : `${equipment.maintenanceDue} days`}</span>
              </div>
            </div>
            <Progress 
              value={equipment.efficiency} 
              className={`h-2 ${
                equipment.efficiency > 90 ? "bg-secondary [&>div]:bg-vigia-success" : 
                equipment.efficiency > 80 ? "bg-secondary [&>div]:bg-vigia-teal" : 
                equipment.efficiency > 70 ? "bg-secondary [&>div]:bg-amber-500" : 
                "bg-secondary [&>div]:bg-vigia-warning"
              }`}
            />
          </div>
          
          <div className="h-[160px] mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Performance History</p>
              <button className="text-xs flex items-center gap-1 text-vigia-teal hover:text-vigia-teal/80 transition-colors">
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
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
                  activeDot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperature" 
                  name="Temperature"
                  stroke="#F97316" 
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="vibration" 
                  name="Vibration"
                  stroke="#D946EF" 
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
          
          {/* Component health section - modified to fix overflow issues */}
          <div className="pt-1 border-t border-border mt-2">
            <h4 className="text-sm font-medium mb-2">Component Health</h4>
            <div className="space-y-2">
              {equipment.components?.map((component, idx) => (
                <div key={idx} className="flex items-center text-xs justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0 flex-shrink">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${
                      component.status === 'normal' ? 'bg-vigia-success' :
                      component.status === 'warning' ? 'bg-vigia-warning' :
                      component.status === 'critical' ? 'bg-vigia-error' :
                      'bg-vigia-blue'
                    }`}></div>
                    <span className="truncate">{component.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-muted/30 rounded-full overflow-hidden flex-shrink-0">
                      <div 
                        className={`h-full rounded-full ${
                          component.healthScore > 85 ? 'bg-vigia-success' :
                          component.healthScore > 70 ? 'bg-vigia-teal' :
                          component.healthScore > 50 ? 'bg-vigia-warning' :
                          'bg-vigia-error'
                        }`}
                        style={{ width: `${component.healthScore}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">{component.healthScore.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RealTimeEquipment: React.FC = () => {
  const [equipments, setEquipments] = useState<EquipmentData[]>(initialEquipments);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [updateSpeed, setUpdateSpeed] = useState<number>(3000); // milliseconds

  // Simulate real-time updates with enhanced realism
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setEquipments(currentEquipment => 
        currentEquipment.map(equipment => {
          // Get current operational state (time of day, load, etc.)
          const operationalState = getCurrentOperationalState();
          
          // Simulate equipment parameters with realistic correlations
          const newPressure = simulatePressure(
            equipment.pressure, 
            equipment.type, 
            operationalState
          );
          
          const newTemp = simulateTemperature(
            equipment.temperature, 
            newPressure, 
            equipment.type, 
            operationalState
          );
          
          const newRPM = simulateRPM(
            equipment.rpm, 
            equipment.type, 
            operationalState
          );
          
          const newVibration = simulateVibration(
            equipment.vibration, 
            newRPM, 
            equipment.type, 
            operationalState
          );
          
          // Calculate efficiency based on all parameters
          const newEfficiency = calculateEfficiency(
            newTemp, 
            newVibration, 
            newPressure, 
            newRPM, 
            equipment.type
          );
          
          // Determine equipment status based on parameters
          const newStatus = determineEquipmentStatus(
            newTemp, 
            newVibration, 
            newPressure, 
            equipment.type
          );
          
          // Update component health scores
          const updatedComponents = equipment.components?.map(component => {
            // Components degrade slowly over time with some randomness
            const healthChange = (Math.random() - 0.6) * 0.5; // Slight downward trend
            const newHealthScore = Math.max(0, Math.min(100, component.healthScore + healthChange));
            
            // Update component status based on health score
            let newStatus = component.status;
            if (newHealthScore < 40) newStatus = 'critical';
            else if (newHealthScore < 75) newStatus = 'warning';
            else newStatus = 'normal';
            
            return {
              ...component,
              healthScore: newHealthScore,
              status: newStatus,
              estimatedLifeRemaining: Math.max(0, component.estimatedLifeRemaining - (Math.random() * 0.2))
            };
          });
          
          // Calculate overall equipment health
          const healthScore = calculateHealthScore({
            ...equipment,
            temperature: newTemp,
            vibration: newVibration,
            pressure: newPressure,
            rpm: newRPM,
            efficiency: newEfficiency
          });
          
          // Current time for history point
          const now = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          
          // Update history data
          const newHistory = [
            ...equipment.history.slice(1), 
            {
              time: now,
              pressure: newPressure,
              temperature: newTemp,
              vibration: newVibration,
              rpm: newRPM
            }
          ];
          
          // Return updated equipment data
          return {
            ...equipment,
            status: newStatus,
            pressure: newPressure,
            temperature: newTemp,
            vibration: newVibration,
            rpm: newRPM,
            efficiency: newEfficiency,
            healthScore: healthScore,
            history: newHistory,
            components: updatedComponents
          };
        })
      );
    }, updateSpeed);
    
    return () => clearInterval(interval);
  }, [isSimulating, updateSpeed]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Real-Time Equipment Monitoring</h2>
        <div className="flex items-center gap-3">
          <select 
            className="text-xs bg-vigia-muted/30 text-muted-foreground rounded-sm px-2 py-1 border-none outline-none"
            value={updateSpeed}
            onChange={(e) => setUpdateSpeed(Number(e.target.value))}
          >
            <option value="1000">Fast Update (1s)</option>
            <option value="3000">Normal Update (3s)</option>
            <option value="5000">Slow Update (5s)</option>
          </select>
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

