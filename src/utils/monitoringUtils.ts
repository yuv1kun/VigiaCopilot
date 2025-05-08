
import { AlertPriority } from "@/types/equipment";

// Safety monitoring parameters with realistic ranges and baseline values
export const SAFETY_PARAMETERS = {
  bopPressure: {
    min: 800,
    max: 2000,
    baseline: 1420,
    noiseLevel: 0.02, // 2% noise
    unit: "PSI"
  },
  wellheadTemperature: {
    min: 50,
    max: 120,
    baseline: 85,
    noiseLevel: 0.01, // 1% noise
    unit: "°C"
  },
  gasDetection: {
    min: 0.5,
    max: 10,
    baseline: 3.2,
    noiseLevel: 0.05, // 5% noise
    unit: "ppm"
  }
};

// Safety thresholds for determining status and alerts
export const SAFETY_THRESHOLDS = {
  bopPressure: {
    warning: 1700,
    alert: 1850
  },
  wellheadTemperature: {
    warning: 95,
    alert: 110
  },
  gasDetection: {
    warning: 5.0,
    alert: 7.5
  }
};

// Simulate BOP pressure based on time of day and operational conditions
export const simulateBOPPressure = (currentPressure: number): number => {
  const timeOfDay = new Date().getHours();
  
  // Operational variations based on time of day (higher during peak hours)
  const operationalFactor = Math.sin((timeOfDay / 24) * 2 * Math.PI);
  const operationalVariation = operationalFactor * 50;
  
  // Random noise component
  const randomNoise = (Math.random() - 0.5) * SAFETY_PARAMETERS.bopPressure.baseline * SAFETY_PARAMETERS.bopPressure.noiseLevel;
  
  // Occasional pressure spikes or drops (1% chance)
  const anomaly = Math.random() > 0.99 ? (Math.random() > 0.5 ? 100 : -100) : 0;
  
  // Calculate new pressure with some inertia (pressure changes relatively slowly)
  const newPressure = currentPressure * 0.9 + 
                     (SAFETY_PARAMETERS.bopPressure.baseline + operationalVariation + randomNoise + anomaly) * 0.1;
  
  // Add realistic constraints
  return Math.max(SAFETY_PARAMETERS.bopPressure.min, 
                 Math.min(SAFETY_PARAMETERS.bopPressure.max, newPressure));
};

// Simulate wellhead temperature with correlation to BOP pressure
export const simulateWellheadTemperature = (currentTemp: number, bopPressure: number): number => {
  // Pressure affects temperature (higher pressure = higher temperature)
  const pressureEffect = (bopPressure - SAFETY_PARAMETERS.bopPressure.baseline) * 0.02;
  
  // Ambient temperature influence based on time of day
  const timeOfDay = new Date().getHours();
  const ambientFactor = Math.sin(((timeOfDay - 14) / 24) * 2 * Math.PI); // Peak at 2pm
  const ambientVariation = ambientFactor * 3;
  
  // Random noise component
  const randomNoise = (Math.random() - 0.5) * SAFETY_PARAMETERS.wellheadTemperature.baseline * SAFETY_PARAMETERS.wellheadTemperature.noiseLevel;
  
  // Calculate new temperature with significant inertia (temperature changes very slowly)
  const newTemp = currentTemp * 0.95 + 
                 (SAFETY_PARAMETERS.wellheadTemperature.baseline + pressureEffect + ambientVariation + randomNoise) * 0.05;
  
  // Add realistic constraints
  return Math.max(SAFETY_PARAMETERS.wellheadTemperature.min, 
                 Math.min(SAFETY_PARAMETERS.wellheadTemperature.max, newTemp));
};

// Simulate gas detection with some correlation to temperature
export const simulateGasDetection = (currentValue: number, temperature: number): number => {
  // Temperature correlation (higher temp may cause more gas release)
  const tempEffect = (temperature - SAFETY_PARAMETERS.wellheadTemperature.baseline) * 0.04;
  
  // Random variation component (gas detection can fluctuate more)
  const randomNoise = (Math.random() - 0.5) * SAFETY_PARAMETERS.gasDetection.baseline * SAFETY_PARAMETERS.gasDetection.noiseLevel;
  
  // Occasional gas spikes (0.5% chance)
  const anomaly = Math.random() > 0.995 ? Math.random() * 2 : 0;
  
  // Calculate new gas detection level with moderate inertia
  const newValue = currentValue * 0.8 + 
                  (SAFETY_PARAMETERS.gasDetection.baseline + tempEffect + randomNoise + anomaly) * 0.2;
  
  // Add realistic constraints
  return Math.max(SAFETY_PARAMETERS.gasDetection.min, 
                 Math.min(SAFETY_PARAMETERS.gasDetection.max, newValue));
};

// Determine status based on value and thresholds
export const determineStatus = (
  value: number, 
  parameter: "bopPressure" | "wellheadTemperature" | "gasDetection"
): "normal" | "warning" | "alert" | "inactive" => {
  if (value >= SAFETY_THRESHOLDS[parameter].alert) {
    return "alert";
  } else if (value >= SAFETY_THRESHOLDS[parameter].warning) {
    return "warning";
  }
  return "normal";
};

// Calculate trend direction and percentage
export const calculateTrend = (current: number, previous: number) => {
  if (!previous) return { value: 0, direction: 'flat' as const };
  const difference = current - previous;
  const percentChange = (difference / previous) * 100;
  
  let direction: 'up' | 'down' | 'flat';
  if (Math.abs(percentChange) < 0.5) {
    direction = 'flat';
  } else {
    direction = percentChange > 0 ? 'up' : 'down';
  }
  
  return {
    value: Math.min(Math.abs(percentChange), 99).toFixed(1),
    direction
  };
};

// Format value with appropriate precision based on parameter type
export const formatValue = (
  value: number, 
  parameter: "bopPressure" | "wellheadTemperature" | "gasDetection"
): string => {
  switch (parameter) {
    case "bopPressure":
      return `${Math.round(value)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "wellheadTemperature":
      return `${value.toFixed(1)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "gasDetection":
      return `${value.toFixed(1)} ${SAFETY_PARAMETERS[parameter].unit}`;
    default:
      return `${value}`;
  }
};

// Generate alert based on parameter status
export const generateAlert = (
  parameter: "bopPressure" | "wellheadTemperature" | "gasDetection", 
  value: number,
  threshold: number
): { message: string; priority: AlertPriority } => {
  let priority: AlertPriority = "low";
  let message = "";
  
  // Determine priority based on how far over threshold
  const percentOverThreshold = ((value - threshold) / threshold) * 100;
  
  if (percentOverThreshold > 10) {
    priority = "critical";
  } else if (percentOverThreshold > 5) {
    priority = "high";
  } else if (percentOverThreshold > 2) {
    priority = "medium";
  }
  
  // Generate appropriate message
  switch (parameter) {
    case "bopPressure":
      message = `BOP Pressure at ${Math.round(value)} PSI exceeds safe threshold of ${threshold} PSI`;
      break;
    case "wellheadTemperature":
      message = `Wellhead Temperature at ${value.toFixed(1)}°C exceeds safe threshold of ${threshold}°C`;
      break;
    case "gasDetection":
      message = `Gas levels at ${value.toFixed(1)} ppm exceed safe threshold of ${threshold} ppm`;
      break;
  }
  
  return { message, priority };
};
