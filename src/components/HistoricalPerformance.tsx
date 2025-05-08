
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Calendar, Download, ChartLine, Activity } from 'lucide-react';

interface HistoricalPerformanceProps {
  equipmentId: string;
  equipmentName?: string;
}

// Equipment type-specific parameters for more realistic simulation
const EQUIPMENT_PARAMETERS = {
  'pump-001': {
    pressure: { baseline: 1250, variance: 150 },
    temperature: { baseline: 65, variance: 8 },
    vibration: { baseline: 0.9, variance: 0.5 },
    efficiency: { baseline: 92, variance: 6 },
  },
  'comp-002': {
    pressure: { baseline: 850, variance: 100 },
    temperature: { baseline: 72, variance: 10 },
    vibration: { baseline: 1.2, variance: 0.7 },
    efficiency: { baseline: 88, variance: 8 },
  },
  'pump-003': {
    pressure: { baseline: 980, variance: 120 },
    temperature: { baseline: 78, variance: 12 },
    vibration: { baseline: 2.1, variance: 0.9 },
    efficiency: { baseline: 84, variance: 10 },
  },
};

// Generate historical data for specific equipment or combined data
const generateHistoricalData = (days: number, equipmentId: string) => {
  const data = [];
  const now = new Date();
  
  // Create a sinusoidal pattern with some randomness for realistic trends
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (equipmentId === 'all') {
      // Generate aggregated data for all equipment
      const combinedPoint = {
        date: formattedDate,
        pressure: 0,
        temperature: 0,
        vibration: 0,
        efficiency: 0,
        runtime: 0,
      };
      
      let equipmentCount = 0;
      for (const id of ['pump-001', 'comp-002', 'pump-003']) {
        const params = EQUIPMENT_PARAMETERS[id as keyof typeof EQUIPMENT_PARAMETERS];
        
        // Add basic sine wave pattern with phase offset per equipment
        const dayFactor = Math.sin((i / days) * Math.PI * 2 + (id === 'comp-002' ? 2 : id === 'pump-003' ? 4 : 0));
        const randomness = Math.random() * 0.5;
        
        combinedPoint.pressure += params.pressure.baseline + dayFactor * params.pressure.variance * 0.5 + randomness * params.pressure.variance;
        combinedPoint.temperature += params.temperature.baseline + dayFactor * params.temperature.variance * 0.3 + randomness * params.temperature.variance;
        combinedPoint.vibration += params.vibration.baseline + dayFactor * params.vibration.variance * 0.4 + randomness * params.vibration.variance;
        combinedPoint.efficiency += params.efficiency.baseline + dayFactor * params.efficiency.variance * 0.2 + randomness * params.efficiency.variance * 0.5;
        combinedPoint.runtime += 20 + dayFactor * 2 + randomness * 3;
        
        equipmentCount++;
      }
      
      // Calculate averages
      combinedPoint.pressure /= equipmentCount;
      combinedPoint.temperature /= equipmentCount;
      combinedPoint.vibration /= equipmentCount;
      combinedPoint.efficiency /= equipmentCount;
      combinedPoint.runtime /= equipmentCount;
      
      data.push(combinedPoint);
    } else {
      // Generate data for specific equipment
      const params = EQUIPMENT_PARAMETERS[equipmentId as keyof typeof EQUIPMENT_PARAMETERS];
      if (!params) return [];
      
      // Add basic sine wave pattern for realistic trends
      const dayFactor = Math.sin((i / days) * Math.PI * 2);
      const randomness = Math.random() * 0.5;
      
      data.push({
        date: formattedDate,
        pressure: params.pressure.baseline + dayFactor * params.pressure.variance * 0.5 + randomness * params.pressure.variance,
        temperature: params.temperature.baseline + dayFactor * params.temperature.variance * 0.3 + randomness * params.temperature.variance,
        vibration: params.vibration.baseline + dayFactor * params.vibration.variance * 0.4 + randomness * params.vibration.variance,
        efficiency: params.efficiency.baseline + dayFactor * params.efficiency.variance * 0.2 + randomness * params.efficiency.variance * 0.5,
        runtime: 20 + dayFactor * 2 + randomness * 3,
      });
    }
  }
  
  return data;
};

// Create some events for the equipment (maintenance, downtime, etc.)
const generateEquipmentEvents = (equipmentId: string) => {
  if (equipmentId === 'all') return [];
  
  const events = [];
  const now = new Date();
  
  // Maintenance events
  events.push({
    date: new Date(now.getTime() - (Math.random() * 15 + 5) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: 'maintenance',
    description: 'Scheduled maintenance',
    duration: Math.floor(Math.random() * 5 + 2),
  });
  
  // Warning events
  if (Math.random() > 0.5) {
    events.push({
      date: new Date(now.getTime() - (Math.random() * 10 + 2) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      type: 'warning',
      description: equipmentId === 'pump-003' ? 'High vibration detected' : 'Temperature fluctuation',
      duration: 0,
    });
  }
  
  return events;
};

const chartConfig = {
  pressure: { color: "#33C3F0" },
  temperature: { color: "#F97316" },
  vibration: { color: "#D946EF" },
  efficiency: { color: "#10B981" },
};

const HistoricalPerformance: React.FC<HistoricalPerformanceProps> = ({ equipmentId, equipmentName }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Generate data based on equipment ID and time range
  const weekData = useMemo(() => generateHistoricalData(7, equipmentId), [equipmentId]);
  const monthData = useMemo(() => generateHistoricalData(30, equipmentId), [equipmentId]);
  const yearData = useMemo(() => generateHistoricalData(365, equipmentId), [equipmentId]);
  
  const events = useMemo(() => generateEquipmentEvents(equipmentId), [equipmentId]);
  
  const currentData = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : yearData;
  
  // Get title based on equipment
  const title = equipmentName 
    ? `${equipmentName} Performance Trends`
    : equipmentId === 'all'
    ? 'Combined Equipment Performance Trends'
    : 'Equipment Performance Trends';
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-vigia-teal" />
          Historical Performance Analysis
          {equipmentName && <span className="text-vigia-teal">- {equipmentName}</span>}
        </h2>
        <div className="flex items-center gap-3">
          <button className="text-xs flex items-center gap-1 text-vigia-teal hover:text-vigia-teal/80 transition-colors">
            <Calendar className="h-4 w-4" /> Custom Date Range
          </button>
          <button className="text-xs flex items-center gap-1 text-vigia-teal hover:text-vigia-teal/80 transition-colors">
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>
      
      <Card className="bg-vigia-card border-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
              <TabsList className="bg-vigia-muted/30">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="pressure" 
                    name="Pressure (PSI)"
                    stroke="#33C3F0" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)"
                    stroke="#F97316" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="vibration" 
                    name="Vibration (mm/s)"
                    stroke="#D946EF" 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-vigia-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Efficiency Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    name="Efficiency (%)"
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-vigia-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {equipmentId === 'all' ? 'Average Runtime Hours' : 'Daily Runtime Hours'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="runtime" name="Runtime (hours)" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {events.length > 0 && (
        <Card className="bg-vigia-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Equipment Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="flex items-center p-2 rounded-md border border-border">
                  <div className={`h-3 w-3 rounded-full mr-3 ${
                    event.type === 'maintenance' ? 'bg-vigia-teal' : 'bg-vigia-warning'
                  }`}></div>
                  <div className="text-sm">
                    <span className="font-medium">{event.date}</span>
                    <span className="mx-2">-</span>
                    <span>{event.description}</span>
                    {event.duration > 0 && (
                      <span className="text-muted-foreground ml-2">
                        ({event.duration} hours)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoricalPerformance;
