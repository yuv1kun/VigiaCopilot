
// PPE compliance parameters with baseline values and fluctuation properties
const PPE_PARAMETERS = {
  hardHat: {
    min: 85,
    max: 100,
    baseline: 96,
    noiseLevel: 0.015, // 1.5% noise
    shiftLevel: 0.02  // 2% shift per update
  },
  safetyGlasses: {
    min: 90,
    max: 100,
    baseline: 99,
    noiseLevel: 0.01, // 1% noise
    shiftLevel: 0.015 // 1.5% shift per update
  },
  safetyVests: {
    min: 70,
    max: 100,
    baseline: 85,
    noiseLevel: 0.025, // 2.5% noise
    shiftLevel: 0.03  // 3% shift per update
  },
  protectiveGloves: {
    min: 65,
    max: 100,
    baseline: 80,
    noiseLevel: 0.03, // 3% noise
    shiftLevel: 0.035 // 3.5% shift per update
  }
};

// Types of PPE for type safety
type PPEType = keyof typeof PPE_PARAMETERS;

// Direction type for trend
export type TrendDirection = 'up' | 'down' | 'flat';

// Trend type interface
export interface Trend {
  value: number;
  direction: TrendDirection;
}

// Time-based factors affecting compliance
const getTimeBasedFactors = (): { shiftChange: boolean; peakHours: boolean } => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Shift changes (typically occur at 6am, 2pm, and 10pm in oil rigs)
  const isShiftChange = 
    (hour === 6 && minute < 30) || 
    (hour === 14 && minute < 30) || 
    (hour === 22 && minute < 30);
  
  // Peak operational hours (higher activity, more potential for PPE non-compliance)
  const isPeakHours = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
  
  return { 
    shiftChange: isShiftChange, 
    peakHours: isPeakHours 
  };
};

// Function to simulate realistic PPE compliance fluctuations
export const simulatePPECompliance = (currentValue: number, ppeType: PPEType): number => {
  const params = PPE_PARAMETERS[ppeType];
  const { shiftChange, peakHours } = getTimeBasedFactors();
  
  // Base tendency - slowly moves towards baseline
  const baselineTendency = (params.baseline - currentValue) * 0.05;
  
  // Random noise component
  const randomNoise = (Math.random() - 0.5) * 2 * params.noiseLevel * 100;
  
  // Shift change effect (compliance typically drops during shift changes)
  const shiftEffect = shiftChange ? -Math.random() * 5 : 0;
  
  // Peak hour effect (compliance may drop during busy periods)
  const peakEffect = peakHours ? -Math.random() * 3 : 0;
  
  // Occasional events (1% chance of a significant drop - represents incidents)
  const eventEffect = Math.random() > 0.99 ? -Math.random() * 15 : 0;
  
  // Calculate new compliance value with all factors
  let newValue = currentValue + baselineTendency + randomNoise + shiftEffect + peakEffect + eventEffect;
  
  // Add realistic constraints
  newValue = Math.max(params.min, Math.min(params.max, newValue));
  
  // Round to nearest whole number for display
  return Math.round(newValue);
};

// Function to determine compliance status
export const determineComplianceStatus = (value: number): 'critical' | 'warning' | 'good' | 'excellent' => {
  if (value < 75) return 'critical';
  if (value < 85) return 'warning';
  if (value < 95) return 'good';
  return 'excellent';
};

// Calculate compliance trend
export const calculateComplianceTrend = (current: number, previous: number): Trend => {
  if (!previous) return { value: 0, direction: 'flat' };
  const difference = current - previous;
  const percentChange = difference;
  
  let direction: TrendDirection;
  if (Math.abs(percentChange) < 0.5) {
    direction = 'flat';
  } else {
    direction = percentChange > 0 ? 'up' : 'down';
  }
  
  return {
    value: Math.abs(percentChange),
    direction
  };
};
