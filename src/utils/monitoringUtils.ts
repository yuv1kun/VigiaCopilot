
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
  },
  sealIntegrity: {
    min: 70,
    max: 100,
    baseline: 96,
    noiseLevel: 0.01, // 1% noise
    unit: "%"
  },
  pipeCorrosion: {
    min: 0.05,
    max: 0.5,
    baseline: 0.23,
    noiseLevel: 0.03, // 3% noise
    unit: "mm/yr"
  },
  nextMaintenance: {
    min: 1,
    max: 30,
    baseline: 7,
    noiseLevel: 0.02, // 2% noise
    unit: "days"
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
  },
  sealIntegrity: {
    warning: 85,
    alert: 75
  },
  pipeCorrosion: {
    warning: 0.30,
    alert: 0.40
  },
  nextMaintenance: {
    warning: 3,
    alert: 1
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

// Simulate seal integrity with correlation to gas detection (gas leaks can indicate seal issues)
export const simulateSealIntegrity = (currentIntegrity: number, gasDetection: number): number => {
  // Gas detection correlation (higher gas = potential seal issues)
  const gasEffect = (SAFETY_PARAMETERS.gasDetection.baseline - gasDetection) * 1.5;
  
  // Time-based degradation (seals naturally degrade over time)
  const timeFactor = Math.sin(new Date().getTime() / 86400000) * 0.5;
  
  // Random noise component
  const randomNoise = (Math.random() - 0.5) * SAFETY_PARAMETERS.sealIntegrity.noiseLevel * 2;
  
  // Calculate new integrity with high inertia (seals degrade slowly)
  const newIntegrity = currentIntegrity * 0.98 + 
                       (SAFETY_PARAMETERS.sealIntegrity.baseline + gasEffect + timeFactor + randomNoise) * 0.02;
  
  // Add realistic constraints
  return Math.max(SAFETY_PARAMETERS.sealIntegrity.min, 
                 Math.min(SAFETY_PARAMETERS.sealIntegrity.max, newIntegrity));
};

// Simulate pipe corrosion with correlation to temperature and time
export const simulatePipeCorrosion = (currentCorrosion: number, temperature: number): number => {
  // Temperature correlation (higher temperature accelerates corrosion)
  const tempEffect = (temperature - SAFETY_PARAMETERS.wellheadTemperature.baseline) * 0.003;
  
  // Slow increasing trend (corrosion generally increases over time)
  const timeTrend = Math.sin(new Date().getTime() / 8640000) * 0.01 + 0.005;
  
  // Random noise component
  const randomNoise = (Math.random() - 0.5) * SAFETY_PARAMETERS.pipeCorrosion.baseline * SAFETY_PARAMETERS.pipeCorrosion.noiseLevel;
  
  // Calculate new corrosion rate with very high inertia (corrosion changes very slowly)
  const newCorrosion = currentCorrosion * 0.99 + 
                       (SAFETY_PARAMETERS.pipeCorrosion.baseline + tempEffect + timeTrend + randomNoise) * 0.01;
  
  // Add realistic constraints
  return Math.max(SAFETY_PARAMETERS.pipeCorrosion.min, 
                 Math.min(SAFETY_PARAMETERS.pipeCorrosion.max, newCorrosion));
};

// Simulate days until next maintenance based on seal integrity and pipe corrosion
export const simulateMaintenanceDays = (currentDays: number, sealIntegrity: number, pipeCorrosion: number): number => {
  // Calculate impact from seal integrity (lower integrity = sooner maintenance)
  const sealImpact = (sealIntegrity - SAFETY_PARAMETERS.sealIntegrity.baseline) * 0.2;
  
  // Calculate impact from pipe corrosion (higher corrosion = sooner maintenance)
  const corrosionImpact = (SAFETY_PARAMETERS.pipeCorrosion.baseline - pipeCorrosion) * 10;
  
  // Random variation (maintenance schedules can change based on resource availability)
  const randomVariation = (Math.random() - 0.5) * 0.2;
  
  // Calculate new maintenance days with moderate inertia (schedules change with some stability)
  const newDays = currentDays * 0.9 + 
                  (SAFETY_PARAMETERS.nextMaintenance.baseline + sealImpact + corrosionImpact + randomVariation) * 0.1;
  
  // Add realistic constraints and round to whole days
  return Math.max(SAFETY_PARAMETERS.nextMaintenance.min, 
                 Math.min(SAFETY_PARAMETERS.nextMaintenance.max, Math.round(newDays)));
};

// Determine status based on value and thresholds
export const determineStatus = (
  value: number, 
  parameter: keyof typeof SAFETY_THRESHOLDS
): "normal" | "warning" | "alert" | "inactive" => {
  const thresholds = SAFETY_THRESHOLDS[parameter];
  
  // For parameters where higher values are better (like seal integrity)
  if (parameter === 'sealIntegrity' || parameter === 'nextMaintenance') {
    if (value <= thresholds.alert) {
      return "alert";
    } else if (value <= thresholds.warning) {
      return "warning";
    }
  } 
  // For parameters where lower values are better
  else {
    if (value >= thresholds.alert) {
      return "alert";
    } else if (value >= thresholds.warning) {
      return "warning";
    }
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
    value: Math.abs(percentChange) < 99 ? Math.abs(percentChange).toFixed(1) : 99,
    direction
  };
};

// Format value with appropriate precision based on parameter type
export const formatValue = (
  value: number, 
  parameter: keyof typeof SAFETY_PARAMETERS
): string => {
  switch (parameter) {
    case "bopPressure":
      return `${Math.round(value)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "wellheadTemperature":
      return `${value.toFixed(1)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "gasDetection":
      return `${value.toFixed(1)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "sealIntegrity":
      return `${value.toFixed(1)}${SAFETY_PARAMETERS[parameter].unit}`;
    case "pipeCorrosion":
      return `${value.toFixed(2)} ${SAFETY_PARAMETERS[parameter].unit}`;
    case "nextMaintenance":
      return `${Math.round(value)} ${SAFETY_PARAMETERS[parameter].unit}`;
    default:
      return `${value}`;
  }
};

// Generate alert based on parameter status
export const generateAlert = (
  parameter: keyof typeof SAFETY_THRESHOLDS, 
  value: number,
  threshold: number
): { message: string; priority: AlertPriority } => {
  let priority: AlertPriority = "low";
  let message = "";
  
  // Determine priority based on how far over/under threshold
  const isHigherBetter = parameter === 'sealIntegrity' || parameter === 'nextMaintenance';
  const percentDeviation = isHigherBetter 
    ? ((threshold - value) / threshold) * 100 
    : ((value - threshold) / threshold) * 100;
  
  if (percentDeviation > 10) {
    priority = "critical";
  } else if (percentDeviation > 5) {
    priority = "high";
  } else if (percentDeviation > 2) {
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
    case "sealIntegrity":
      message = `Seal integrity at ${value.toFixed(1)}% below safe threshold of ${threshold}%`;
      break;
    case "pipeCorrosion":
      message = `Pipe corrosion rate at ${value.toFixed(2)} mm/yr exceeds safe threshold of ${threshold} mm/yr`;
      break;
    case "nextMaintenance":
      message = `Maintenance required in ${Math.round(value)} days, below safe threshold of ${threshold} days`;
      break;
  }
  
  return { message, priority };
};
