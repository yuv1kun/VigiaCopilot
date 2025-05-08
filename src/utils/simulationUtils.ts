
import { EquipmentStatus } from '@/types/equipment';

// Equipment type-specific parameters
const EQUIPMENT_PARAMETERS = {
  pump: {
    pressure: { min: 800, max: 1800, baseline: 1250, noiseLevel: 0.04 },
    temperature: { min: 45, max: 90, baseline: 65, noiseLevel: 0.03 },
    vibration: { min: 0.2, max: 3.5, baseline: 0.9, noiseLevel: 0.06 },
    rpm: { min: 1200, max: 2400, baseline: 1800, noiseLevel: 0.02 }
  },
  compressor: {
    pressure: { min: 600, max: 1400, baseline: 850, noiseLevel: 0.05 },
    temperature: { min: 50, max: 95, baseline: 72, noiseLevel: 0.04 },
    vibration: { min: 0.4, max: 3.8, baseline: 1.2, noiseLevel: 0.07 },
    rpm: { min: 2800, max: 4200, baseline: 3600, noiseLevel: 0.03 }
  }
};

// Equipment operational states that affect simulation
interface OperationalState {
  timeOfDay: number;
  operationalLoad: number;
  ambientTemperature: number;
  maintenanceScore: number;
}

// Get current operational state based on real-world factors
export const getCurrentOperationalState = (): OperationalState => {
  const now = new Date();
  const timeOfDay = now.getHours();
  
  // Operational load varies by time of day - higher during day, lower at night
  const operationalLoad = 0.6 + 0.4 * Math.sin(((timeOfDay - 6) / 24) * 2 * Math.PI);
  
  // Ambient temperature varies by time of day
  const ambientTemperature = 22 + 8 * Math.sin(((timeOfDay - 14) / 24) * 2 * Math.PI);
  
  // Maintenance score (0-1) simulates equipment condition degradation over time
  const maintenanceScore = 0.8 + (Math.sin(now.getTime() / 8640000) * 0.2);
  
  return {
    timeOfDay,
    operationalLoad,
    ambientTemperature,
    maintenanceScore
  };
};

// Simulate pressure with realistic variations
export const simulatePressure = (baselinePressure: number, equipmentType: string, operationalState: OperationalState): number => {
  const params = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].pressure;
  
  // Operational variations based on time of day and load
  const operationalVariation = (operationalState.operationalLoad - 0.6) * params.baseline * 0.2;
  
  // Random noise with specified noise level
  const randomNoise = (Math.random() - 0.5) * params.baseline * params.noiseLevel;
  
  // Maintenance effect (lower maintenance score = more pressure fluctuations)
  const maintenanceEffect = (1 - operationalState.maintenanceScore) * params.baseline * 0.15;
  
  // Calculate new pressure with all factors
  let newPressure = baselinePressure + operationalVariation + randomNoise;
  
  // Occasionally add small pressure spikes or drops (1% chance)
  if (Math.random() < 0.01) {
    newPressure += (Math.random() > 0.5 ? 1 : -1) * params.baseline * 0.15;
  }
  
  // Add realistic constraints
  return Math.max(params.min, Math.min(params.max, newPressure));
};

// Simulate temperature with correlation to pressure and ambient conditions
export const simulateTemperature = (currentTemp: number, pressure: number, equipmentType: string, operationalState: OperationalState): number => {
  const params = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].temperature;
  
  // Pressure affects temperature (higher pressure = higher temperature)
  const pressureEffect = (pressure - EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].pressure.baseline) * 0.03;
  
  // Ambient temperature influence
  const ambientEffect = (operationalState.ambientTemperature - 22) * 0.1;
  
  // Random noise with specified noise level
  const randomNoise = (Math.random() - 0.5) * params.baseline * params.noiseLevel;
  
  // Calculate new temperature with inertia (temperature changes more slowly)
  let newTemp = currentTemp * 0.85 + (params.baseline + pressureEffect + ambientEffect + randomNoise) * 0.15;
  
  // Add realistic constraints
  return Math.max(params.min, Math.min(params.max, newTemp));
};

// Simulate vibration with correlation to RPM and equipment condition
export const simulateVibration = (currentVibration: number, rpm: number, equipmentType: string, operationalState: OperationalState): number => {
  const params = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].vibration;
  
  // RPM affects vibration
  const rpmEffect = (rpm - EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].rpm.baseline) * 0.0005;
  
  // Maintenance effect (lower maintenance score = more vibration)
  const maintenanceEffect = (1 - operationalState.maintenanceScore) * params.baseline * 0.5;
  
  // Random noise with specified noise level
  const randomNoise = (Math.random() - 0.5) * params.baseline * params.noiseLevel;
  
  // Calculate new vibration with some inertia
  let newVibration = currentVibration * 0.7 + (params.baseline + rpmEffect + maintenanceEffect + randomNoise) * 0.3;
  
  // Occasionally add vibration spikes (2% chance)
  if (Math.random() < 0.02) {
    newVibration += params.baseline * 0.3 * Math.random();
  }
  
  // Add realistic constraints
  return Math.max(params.min, Math.min(params.max, newVibration));
};

// Simulate RPM based on operational load
export const simulateRPM = (currentRPM: number, equipmentType: string, operationalState: OperationalState): number => {
  const params = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].rpm;
  
  // Operational load directly affects RPM
  const loadEffect = (operationalState.operationalLoad - 0.6) * params.baseline * 0.2;
  
  // Random noise with specified noise level
  const randomNoise = (Math.random() - 0.5) * params.baseline * params.noiseLevel;
  
  // Calculate new RPM with some inertia (RPM changes more slowly)
  let newRPM = currentRPM * 0.9 + (params.baseline + loadEffect + randomNoise) * 0.1;
  
  // Add realistic constraints
  return Math.max(params.min, Math.min(params.max, newRPM));
};

// Calculate equipment efficiency based on multiple factors
export const calculateEfficiency = (temperature: number, vibration: number, pressure: number, rpm: number, equipmentType: string): number => {
  // Get baseline parameters for this equipment type
  const tempParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].temperature;
  const vibParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].vibration;
  const pressParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].pressure;
  const rpmParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].rpm;
  
  // Calculate temperature efficiency (lower is better)
  const tempEfficiency = 1 - Math.abs(temperature - tempParams.baseline) / (tempParams.max - tempParams.baseline);
  
  // Calculate vibration efficiency (lower vibration is better)
  const vibrationEfficiency = 1 - (vibration - vibParams.min) / (vibParams.max - vibParams.min);
  
  // Calculate pressure efficiency (closer to baseline is better)
  const pressureEfficiency = 1 - Math.abs(pressure - pressParams.baseline) / (pressParams.max - pressParams.min);
  
  // Calculate RPM efficiency (closer to baseline is better)
  const rpmEfficiency = 1 - Math.abs(rpm - rpmParams.baseline) / (rpmParams.max - rpmParams.min);
  
  // Weight the factors differently based on importance
  const weightedEfficiency = 
    tempEfficiency * 0.3 + 
    vibrationEfficiency * 0.35 + 
    pressureEfficiency * 0.2 + 
    rpmEfficiency * 0.15;
  
  // Convert to percentage and add a baseline
  return Math.max(60, Math.min(98, weightedEfficiency * 35 + 65));
};

// Determine equipment status based on parameters
export const determineEquipmentStatus = (
  temperature: number,
  vibration: number,
  pressure: number,
  equipmentType: string
): EquipmentStatus => {
  const tempParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].temperature;
  const vibParams = EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].vibration;
  
  // Critical conditions
  if (temperature > tempParams.max - 5 || vibration > vibParams.max - 0.5) {
    return 'failure';
  }
  
  // Warning conditions
  if (temperature > tempParams.max - 15 || 
      vibration > vibParams.max - 1 || 
      pressure > EQUIPMENT_PARAMETERS[equipmentType as keyof typeof EQUIPMENT_PARAMETERS].pressure.max - 100) {
    return 'warning';
  }
  
  // Offline check would be handled elsewhere
  
  // Normal operation
  return 'running';
};

// Calculate overall health score for predictive maintenance
export const calculateHealthScore = (equipment: any): number => {
  const {
    temperature,
    vibration,
    pressure,
    rpm,
    efficiency,
    operatingHours,
    type
  } = equipment;
  
  // Get baseline parameters
  const params = EQUIPMENT_PARAMETERS[type as keyof typeof EQUIPMENT_PARAMETERS];
  
  // Calculate factors
  const tempFactor = 1 - Math.abs(temperature - params.temperature.baseline) / 
                       (params.temperature.max - params.temperature.baseline);
  
  const vibFactor = 1 - (vibration - params.vibration.min) / 
                       (params.vibration.max - params.vibration.min);
  
  const hoursFactor = Math.max(0, 1 - (operatingHours / 5000));
  
  // Weighted health score
  const healthScore = 
    tempFactor * 0.25 + 
    vibFactor * 0.35 + 
    (efficiency / 100) * 0.25 + 
    hoursFactor * 0.15;
  
  // Convert to 0-100 scale
  return Math.max(0, Math.min(100, healthScore * 100));
};

// Generate moving average for trend analysis
export const calculateMovingAverage = (data: number[], windowSize: number): number[] => {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(data[i]);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += data[i - j];
    }
    result.push(sum / windowSize);
  }
  
  return result;
};
