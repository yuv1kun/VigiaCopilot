
import { Alert, AlertPriority } from "@/types/equipment";

// Returns a time-weighted probability value (0-1) that increases during certain hours
export const getTimeWeightedProbability = (): number => {
  const hour = new Date().getHours();
  
  // Higher probability during shift changes (6-8am, 2-4pm, 10pm-12am)
  const isShiftChange = (hour >= 6 && hour <= 8) || 
                        (hour >= 14 && hour <= 16) || 
                        (hour >= 22 && hour <= 24);
                        
  // Higher probability during night operations (10pm-6am)
  const isNightOps = hour >= 22 || hour <= 6;
  
  // Base probability
  let probability = 0.1;
  
  // Adjust based on operational factors
  if (isShiftChange) probability *= 1.5;
  if (isNightOps) probability *= 1.3;
  
  return probability;
};

// Get the weather condition impact on alert probability
export const getWeatherImpact = (): { condition: string; impact: number } => {
  // Simulate weather conditions changing every few hours
  const date = new Date();
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 3)); // Change every 3 hours
  const pseudoRandom = Math.sin(seed) * 10000;
  const weatherConditionIndex = Math.floor(Math.abs(pseudoRandom) % 5);
  
  const weatherConditions = [
    { condition: "Clear", impact: 1.0 },
    { condition: "Cloudy", impact: 1.1 },
    { condition: "Rain", impact: 1.3 },
    { condition: "Storm", impact: 1.8 },
    { condition: "High Winds", impact: 1.5 }
  ];
  
  return weatherConditions[weatherConditionIndex];
};

// Generate specific alert types based on operational conditions
export const generateSpecificAlert = (): Alert => {
  const currentHour = new Date().getHours();
  const weather = getWeatherImpact();
  
  // Different alert categories with probabilities adjusted by time and weather
  const categories = [
    { type: "equipment", probability: 0.3 * weather.impact },
    { type: "safety", probability: 0.25 },
    { type: "environmental", probability: 0.15 * weather.impact },
    { type: "process", probability: 0.2 },
    { type: "personnel", probability: 0.1 }
  ];
  
  // Weight the probabilities
  const totalWeight = categories.reduce((sum, cat) => sum + cat.probability, 0);
  const normalizedCategories = categories.map(cat => ({ 
    ...cat, 
    probability: cat.probability / totalWeight 
  }));
  
  // Select a category based on weighted probability
  const rand = Math.random();
  let cumulativeProbability = 0;
  let selectedCategory: string = "equipment";
  
  for (const cat of normalizedCategories) {
    cumulativeProbability += cat.probability;
    if (rand <= cumulativeProbability) {
      selectedCategory = cat.type;
      break;
    }
  }
  
  // Define specific alerts for each category
  const alertsByCategory: Record<string, Array<{ message: string; priority: AlertPriority; parameter: string; equipmentId: string; value: number; threshold: number }>> = {
    equipment: [
      { message: "Pressure relief valve PSV-101 activation detected", priority: "high", parameter: "pressure", equipmentId: "valve-101", value: 120, threshold: 100 },
      { message: "Compressor C-201 vibration exceeding threshold", priority: "medium", parameter: "vibration", equipmentId: "comp-201", value: 15.2, threshold: 12 },
      { message: "Circulation pump P-301 flow rate dropping", priority: "medium", parameter: "flow", equipmentId: "pump-301", value: 42.5, threshold: 50 },
      { message: "Storage tank T-401 level nearing capacity", priority: "low", parameter: "level", equipmentId: "tank-401", value: 85.3, threshold: 90 },
      { message: "BOP accumulator pressure fluctuation", priority: "high", parameter: "pressure", equipmentId: "bop-system", value: 3200, threshold: 3000 }
    ],
    safety: [
      { message: "H2S detected in module M-102", priority: "critical", parameter: "gas", equipmentId: "sensor-h2s-102", value: 11.2, threshold: 10 },
      { message: "Fire detection system activated in area B-3", priority: "critical", parameter: "fire", equipmentId: "fire-system", value: 1, threshold: 0 },
      { message: "Escape route lighting failure in section C", priority: "high", parameter: "lighting", equipmentId: "emergency-lights", value: 65, threshold: 90 },
      { message: "Safety shower S-201 pressure below threshold", priority: "medium", parameter: "pressure", equipmentId: "safety-shower", value: 32, threshold: 40 },
      { message: "PPE compliance in drilling floor below target", priority: "medium", parameter: "compliance", equipmentId: "ppe-system", value: 82, threshold: 95 }
    ],
    environmental: [
      { message: "Increased hydrocarbon concentration in produced water", priority: "medium", parameter: "concentration", equipmentId: "water-treatment", value: 42, threshold: 35 },
      { message: "Flare system efficiency below target", priority: "low", parameter: "efficiency", equipmentId: "flare-system", value: 92, threshold: 98 },
      { message: `${weather.condition}: Platform stability monitoring active`, priority: weather.condition === "Storm" ? "high" : "low", parameter: "stability", equipmentId: "platform-monitors", value: weather.impact * 10, threshold: 15 },
      { message: "Emission levels approaching daily limit", priority: "medium", parameter: "emissions", equipmentId: "emission-control", value: 88, threshold: 95 },
      { message: "Oil containment system pressure test overdue", priority: "low", parameter: "maintenance", equipmentId: "containment-system", value: 45, threshold: 30 }
    ],
    process: [
      { message: "Separation process efficiency degradation", priority: "medium", parameter: "efficiency", equipmentId: "separator-101", value: 78.5, threshold: 85 },
      { message: "Heat exchanger E-201 fouling detected", priority: "low", parameter: "efficiency", equipmentId: "exchanger-201", value: 82, threshold: 90 },
      { message: "Gas dehydration unit moisture above spec", priority: "medium", parameter: "moisture", equipmentId: "dehydration-301", value: 7.2, threshold: 6 },
      { message: "Chemical injection pump rate deviation", priority: "low", parameter: "rate", equipmentId: "chem-pump-101", value: 11.3, threshold: 10 },
      { message: "Production choke valve position feedback error", priority: "medium", parameter: "position", equipmentId: "choke-valve-201", value: 8.5, threshold: 5 }
    ],
    personnel: [
      { message: "Personnel in restricted area without authorization", priority: "medium", parameter: "access", equipmentId: "access-control", value: 1, threshold: 0 },
      { message: "Working hours compliance below threshold", priority: "low", parameter: "compliance", equipmentId: "hr-system", value: 85, threshold: 95 },
      { message: "Competency certification expiring for 3 crew members", priority: "low", parameter: "certification", equipmentId: "training-system", value: 25, threshold: 30 },
      { message: "Manning level below minimum for current operations", priority: "medium", parameter: "manning", equipmentId: "crew-management", value: 85, threshold: 90 },
      { message: "Fatigue risk index elevated for night shift crew", priority: "medium", parameter: "fatigue", equipmentId: "health-monitoring", value: 75, threshold: 70 }
    ]
  };
  
  // Select random alert from the chosen category
  const alerts = alertsByCategory[selectedCategory];
  const selectedAlert = alerts[Math.floor(Math.random() * alerts.length)];
  
  // Adjust alert value based on time of day (more severe at night or shift changes)
  const isNight = currentHour >= 22 || currentHour <= 6;
  const isShiftChange = (currentHour >= 6 && currentHour <= 8) || (currentHour >= 14 && currentHour <= 16);
  let valueAdjustment = 1.0;
  
  if (isNight) valueAdjustment *= 1.1;
  if (isShiftChange) valueAdjustment *= 1.05;
  if (weather.condition === "Storm") valueAdjustment *= 1.15;
  
  // Create and return the alert
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    equipmentId: selectedAlert.equipmentId,
    timestamp: new Date(),
    message: selectedAlert.message,
    parameter: selectedAlert.parameter,
    value: selectedAlert.value * valueAdjustment,
    threshold: selectedAlert.threshold,
    priority: selectedAlert.priority,
    isAcknowledged: false
  };
};

// Determine if an alert should auto-resolve based on its characteristics
export const shouldAutoResolve = (alert: Alert): boolean => {
  // High or critical alerts have lower auto-resolve chances
  if (alert.priority === "critical") return Math.random() > 0.95; // 5% chance
  if (alert.priority === "high") return Math.random() > 0.8;     // 20% chance
  if (alert.priority === "medium") return Math.random() > 0.6;   // 40% chance
  return Math.random() > 0.4;                                    // 60% chance for low
};

// Format timestamp to human-readable string
export const getTimeString = (date: Date): string => {
  if (!(date instanceof Date)) {
    // Convert string timestamp to Date object if needed
    date = new Date(date);
  }
  
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
};
